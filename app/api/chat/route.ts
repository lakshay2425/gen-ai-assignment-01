import {
  HITESH_SIR_SYSTEM_PROMPT,
  PIYUSH_SIR_SYSTEM_PROMPT,
} from "@/lib/PROMPT";
import { rateLimit } from "@/lib/rate-limit";
// import { tools } from "@/lib/tools";
import {
  MAX_INPUT_LENGTH,
  MAX_OUTPUT_TOKENS,
  type Persona,
} from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const chatRequestSchema = z.object({
  persona: z.enum(["hitesh", "piyush"]),
  message: z
    .string()
    .min(1, "Message is required")
    .max(MAX_INPUT_LENGTH, `Message must be at most ${MAX_INPUT_LENGTH} characters`),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function getSystemPrompt(persona: Persona): string {
  return persona === "hitesh"
    ? HITESH_SIR_SYSTEM_PROMPT
    : PIYUSH_SIR_SYSTEM_PROMPT;
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const result = rateLimit(ip);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((result.resetAt - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }

    const { persona, message, history } = parsed.data;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: "system", content: getSystemPrompt(persona) },
        ...history.map((entry) => ({
          role: entry.role,
          content: entry.content,
        })),
        { role: "user", content: message },
      ],
      // ...(tools.length > 0 ? { tools } : {}),
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 502 },
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 },
    );
  }
}
