export const siteConfig = {
  name: "Persona Chat",
  description:
    "Chat with Hitesh Sir or Piyush Sir. Switch personas, keep separate histories, and get AI-powered responses.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  keywords: [
    "Persona Chat",
    "AI chat",
    "Hitesh Sir",
    "Piyush Sir",
    "OpenAI",
    "Next.js",
  ],
} as const;

export function getSiteUrl(): string {
  return siteConfig.url.replace(/\/$/, "");
}
