# Persona Chat

A single-page chat app built with Next.js where users can talk to two personas — **Hitesh Sir** and **Piyush Sir**. Each persona has its own conversation history, powered by the OpenAI API.

## Features

- Switch between **Hitesh Sir** and **Piyush Sir** personas
- Separate chat histories per persona (messages are not shared when switching)
- Client-side message storage (max 20 messages per persona; oldest messages drop when the limit is exceeded; cleared on page refresh)
- Input limited to 500 characters; output capped via `max_tokens: 500`
- **New Chat** clears the current persona's history while keeping that persona selected
- IP-based rate limiting (5 requests/minute, 30 requests/day)
- Friendly error handling for rate limits and AI service outages
- System prompts defined in `lib/PROMPT.ts`

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, standalone output)
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)
- [TanStack Query v5](https://tanstack.com/query)
- [OpenAI Node SDK](https://github.com/openai/openai-node) (`gpt-4o-mini`)
- [Axios](https://axios-http.com) for API requests
- [react-hot-toast](https://react-hot-toast.com) for notifications
- [Zod](https://zod.dev) for request validation

## Prerequisites

- **Node.js** 20+ (24 recommended)
- **pnpm** 10+ (`corepack enable pnpm`)
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/lakshay2425/gen-ai-assignment-01
cd gen-ai-assignment-01
pnpm install
```

### 2. Environment variables

Copy the sample env file and add your OpenAI key:

```bash
cp .env.sample .env.local
```

Add the following to `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for chat completions |
| `NEXT_PUBLIC_APP_URL` | No | Base URL for client-side API requests (defaults to same origin) |

> Never commit `.env.local` — it is gitignored.

## Run

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
pnpm build
pnpm start
```

### Lint

```bash
pnpm lint
```

## Docker

The app is configured for [standalone](https://nextjs.org/docs/app/api-reference/config/next-config-js/output) output and ships with a multi-stage Dockerfile.

Build the image:

```bash
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://your-domain.com \
  -t persona-chat .
```

Run the container:

```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_openai_api_key \
  persona-chat
```

The app listens on port 3000.

## Usage

1. Open the app and **choose a persona** (Hitesh Sir or Piyush Sir).
2. Type a message (up to 500 characters) and click **Send**.
3. Switch personas using the header toggle — each persona keeps its own history.
4. Click **New Chat** to clear the current persona's messages and start fresh.

Messages are stored in memory only and reset when you refresh the page.

## Project structure

```
assignment-1/
├── app/
│   ├── api/chat/route.ts       # OpenAI chat API route (validation, rate limiting)
│   ├── layout.tsx              # Root layout, metadata, providers
│   ├── page.tsx                # Chat UI (persona picker, messages, composer)
│   └── providers/              # TanStack Query and tooltip providers
├── features/chat/
│   ├── hooks/chat-mutation.ts  # TanStack Query mutation for sending messages
│   └── utils/messages.ts       # Message helpers and rolling history limit
├── lib/
│   ├── PROMPT.ts               # System prompts per persona
│   ├── chat-errors.ts          # User-facing error messages and OpenAI error mapping
│   ├── get-openai-client.ts    # Singleton OpenAI client
│   ├── rate-limit.ts           # In-memory IP rate limiting
│   ├── site-config.ts          # App metadata and SEO config
│   └── types.ts                # Shared types and limits
├── docs/                       # Reference prompt notes
├── Dockerfile                  # Multi-stage production image
└── .env.local                  # Local secrets (not committed)
```

## API

**POST** `/api/chat`

Request body:

```json
{
  "persona": "hitesh",
  "message": "Hello!",
  "history": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous reply" }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `persona` | `"hitesh"` \| `"piyush"` | Active persona |
| `message` | `string` | Current user message (1–500 characters) |
| `history` | `array` | Prior turns for the active persona |

Success response:

```json
{
  "content": "Assistant reply..."
}
```

Error responses return `{ "error": "..." }` with status codes:

| Status | Meaning |
|--------|---------|
| `400` | Invalid request body |
| `429` | Rate limit exceeded |
| `502` | Empty or invalid AI response |
| `503` | OpenAI unavailable or API key not configured |

## CI

GitHub Actions runs on push and pull requests to `master`:

- `pnpm install --frozen-lockfile`
- `pnpm lint`
- `pnpm build`

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Available scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
