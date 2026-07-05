import { axiosInstance } from "@/lib/axiosInstance";
import { CHAT_ERRORS } from "@/lib/chat-errors";
import type { ChatMessage, Persona } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import type { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";
import { appendMessage, createMessage } from "../utils/messages";

type UseChatMutationOptions = {
  setInput: Dispatch<SetStateAction<string>>;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
};

export function useChatMutation({
  setInput,
  setMessages,
}: UseChatMutationOptions) {
  return useMutation({
    mutationFn: async ({
      userMessage,
      history,
      activePersona,
    }: {
      userMessage: string;
      history: ChatMessage[];
      activePersona: Persona;
    }) => {
      try {
        const { data } = await axiosInstance.post<{ content?: string; error?: string }>(
          "/api/chat",
          {
            persona: activePersona,
            message: userMessage,
            history: history.map(({ role, content }) => ({ role, content })),
          },
        );

        if (!data.content) {
          throw new Error("No response received");
        }

        return data.content;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;

          if (status === 429) {
            throw new Error(CHAT_ERRORS.RATE_LIMIT);
          }

          if (status === 502 || status === 503) {
            throw new Error(CHAT_ERRORS.AI_UNAVAILABLE);
          }

          throw new Error("Failed to send message");
        }
        throw error;
      }
    },
    onSuccess: (assistantContent, {  activePersona }) => {
      setMessages((prev) => {
        return appendMessage(
          prev,
          createMessage("assistant", assistantContent, activePersona),
        );
      });
      setInput("");
    },
    onError: () => {
      toast.error("Failed to generate response");
    },
  });
}
