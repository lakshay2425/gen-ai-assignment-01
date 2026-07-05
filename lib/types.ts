export type Persona = "hitesh" | "piyush";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  persona: Persona;
}

export const MAX_MESSAGES = 20;
export const MAX_INPUT_LENGTH = 500;
export const MAX_OUTPUT_TOKENS = 500;

export const PERSONA_LABELS: Record<Persona, string> = {
  hitesh: "Hitesh Sir",
  piyush: "Piyush Sir",
};
