import { axiosInstance } from "@/app/lib/axiosInstance";
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
          if (error.response?.status === 429) {
            throw new Error(
              (error.response.data as { error?: string })?.error ??
                "You've sent too many messages. Please wait",
            );
          }

          throw new Error(
            (error.response?.data as { error?: string })?.error ??
              "Failed to send message",
          );
        }
        throw error;
      }
    },
    onSuccess: (assistantContent, { userMessage, activePersona }) => {
      setMessages((prev) => {
        const withUser = appendMessage(
          prev,
          createMessage("user", userMessage, activePersona),
        );
        return appendMessage(
          withUser,
          createMessage("assistant", assistantContent, activePersona),
        );
      });
      setInput("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
