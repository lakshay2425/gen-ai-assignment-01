import { CHAT_ERRORS } from "@/lib/chat-errors";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};
const requests = new Map<string, RateLimitEntry>();

const MINUTE_LIMIT = 5;
const MINUTE_WINDOW_MS = 60 * 1000;

const DAY_LIMIT = 30;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

function rateLimitWindow(
  identifier: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = requests.get(identifier);

  if (!entry || now > entry.resetAt) {
    requests.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (entry.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count += 1;

  return {
    success: true,
    remaining: limit - entry.count,
    resetAt: entry.resetAt,
  };
}

export function rateLimit(ip: string): RateLimitResult & { error?: string } {
  const minute = rateLimitWindow(`minute:${ip}`, MINUTE_LIMIT, MINUTE_WINDOW_MS);

  if (!minute.success) {
    return {
      ...minute,
      error: CHAT_ERRORS.RATE_LIMIT,
    };
  }

  const day = rateLimitWindow(`day:${ip}`, DAY_LIMIT, DAY_WINDOW_MS);

  if (!day.success) {
    return {
      ...day,
      error: CHAT_ERRORS.RATE_LIMIT,
    };
  }

  return minute;
}
