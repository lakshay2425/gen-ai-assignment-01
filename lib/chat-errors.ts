import OpenAI, { type APIError } from "openai";

export const CHAT_ERRORS = {
  RATE_LIMIT: "Too many messages. Please wait.",
  AI_UNAVAILABLE: "AI service is temporarily unavailable.",
} as const;

export type ChatErrorResponse = {
  status: number;
  error: string;
};

function getOpenAIErrorCode(error: APIError): string | undefined {
  if (
    typeof error.error === "object" &&
    error.error !== null &&
    "code" in error.error
  ) {
    const code = (error.error as { code?: string }).code;
    if (code) return code;
  }

  return error.code ?? undefined;
}

export function mapOpenAIError(error: unknown): ChatErrorResponse {
  const unavailable: ChatErrorResponse = {
    status: 503,
    error: CHAT_ERRORS.AI_UNAVAILABLE,
  };

  if (
    error instanceof OpenAI.APIConnectionError ||
    error instanceof OpenAI.APIConnectionTimeoutError
  ) {
    return unavailable;
  }

  if (error instanceof OpenAI.InternalServerError) {
    return unavailable;
  }

  if (error instanceof OpenAI.APIError) {
    const errorCode = getOpenAIErrorCode(error);

    if (error.status === 429 && errorCode === "insufficient_quota") {
      return unavailable;
    }

    if (error.status === 429) {
      return unavailable;
    }

    if (error.status === 502) {
      return { status: 502, error: CHAT_ERRORS.AI_UNAVAILABLE };
    }

    if (error.status === 503 || (error.status && error.status >= 500)) {
      return unavailable;
    }
  }

  return unavailable;
}
