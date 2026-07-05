"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MAX_INPUT_LENGTH,
  PERSONA_LABELS,
  type ChatMessage,
  type Persona,
} from "@/lib/types";
import { MessageSquarePlusIcon, SendIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useChatMutation } from "@/features/chat/hooks/chat-mutation";
import { appendMessage, createMessage } from "@/features/chat/utils/messages";
import toast from "react-hot-toast";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [input, setInput] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);

  const personaMessages = persona
    ? messages.filter((message) => message.persona === persona)
    : [];

  const chatMutation = useChatMutation({ setMessages, setInput });

  useEffect(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [personaMessages.length, chatMutation.isPending]);

  const handleSubmit = (event: React.SubmitEvent) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!persona || !trimmed || chatMutation.isPending) return;

    const currentPersona = persona;
    const history = personaMessages;
    setMessages((prev) =>
      appendMessage(
        prev,
        createMessage("user", trimmed, currentPersona),
      ),
    );
  
    setInput("");
  
    chatMutation.mutate({
      userMessage: trimmed,
      history: personaMessages,
      activePersona: persona,
    });
  };

  const handleNewChat = () => {
    if (!persona || chatMutation.isPending) {
      toast.error("Please wait for the current chat to complete");
      return;
    }
    setMessages((prev) =>
      prev.filter((message) => message.persona !== persona),
    );  
    setInput("");
    chatMutation.reset();
    toast.success("New chat started");
  };

  const handlePersonaSelect = (selected: Persona) => {
    if(chatMutation.isPending) {
      toast.error("Please wait for the current chat to complete");
      return;
    }
    setPersona(selected);
    setInput("");
  };

  return (
    <div className="flex h-full min-h-screen flex-col bg-background">
      <header className="border-border flex items-center justify-between border-b px-4 py-3 md:px-6">
        <div>
          <h1 className="text-lg font-semibold">Persona Chat</h1>
          {persona && (
            <p className="text-muted-foreground text-sm">
              Chatting with {PERSONA_LABELS[persona]}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {persona && (
            <div className="hidden items-center gap-1 sm:flex">
              {(Object.keys(PERSONA_LABELS) as Persona[]).map((key) => (
                <Button
                  key={key}
                  type="button"
                  variant={persona === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPersona(key)}
                  disabled={chatMutation.isPending}
                >
                  {PERSONA_LABELS[key]}
                </Button>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNewChat}
            disabled={chatMutation.isPending}
          >
            <MessageSquarePlusIcon />
            New Chat
          </Button>
        </div>
      </header>

      {!persona ? (
        <PersonaPicker onSelect={handlePersonaSelect} />
      ) : (
        <>
          <div
            ref={viewportRef}
            className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6"
          >
            {personaMessages.length === 0 ? (
              <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center text-center">
                <h2 className="text-foreground mb-2 text-xl font-medium">
                  Start a conversation with {PERSONA_LABELS[persona]}
                </h2>
              </div>
            ) : (
              personaMessages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))
            )}

            {chatMutation.isPending && (
              <div className="text-muted-foreground text-sm">
                {PERSONA_LABELS[persona]} is typing...
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-border mx-auto w-full max-w-3xl border-t px-4 py-4"
          >
            <div className="border-border bg-muted/30 focus-within:ring-ring/50 flex flex-col gap-2 rounded-2xl border p-3 focus-within:ring-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={`Message ${PERSONA_LABELS[persona]}...`}
                maxLength={MAX_INPUT_LENGTH}
                rows={3}
                disabled={chatMutation.isPending}
                className="placeholder:text-muted-foreground min-h-20 w-full resize-none bg-transparent text-sm outline-none"
              />
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground text-xs">
                  {input.length}/{MAX_INPUT_LENGTH}
                </span>
                <Button
                  type="submit"
                  size="sm"
                  disabled={
                    chatMutation.isPending || input.trim().length === 0
                  }
                >
                  <SendIcon />
                  Send
                </Button>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

function PersonaPicker({
  onSelect,
}: {
  onSelect: (persona: Persona) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-12">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-semibold">Choose a persona</h2>
        <p className="text-muted-foreground text-sm">
          Each persona has its own conversation history. Switching between them
          does not share messages.
        </p>
      </div>

      <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
        {(Object.keys(PERSONA_LABELS) as Persona[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className="border-border hover:bg-muted/50 focus-visible:ring-ring rounded-2xl border px-6 py-8 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <span className="text-lg font-medium">{PERSONA_LABELS[key]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
