import {
    MAX_MESSAGES,
    type ChatMessage,
    type Persona,
  } from "@/lib/types";

export function appendMessage(
    messages: ChatMessage[],
    message: ChatMessage,
  ): ChatMessage[] {
    const next = [...messages, message];
    return next.length > MAX_MESSAGES ? next.slice(1) : next;
  }
  
 export function createMessage(
    role: ChatMessage["role"],
    content: string,
    persona: Persona,
  ): ChatMessage {
    return {
      id: crypto.randomUUID(),
      role,
      content,
      persona,
    };
  }