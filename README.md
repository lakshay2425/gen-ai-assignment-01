# Persona Chat

A single-page chat app built with Next.js where users can talk to two personas — **Hitesh Sir** and **Piyush Sir**. Each persona has its own conversation history, powered by the OpenAI API.

## Features

- Switch between **Hitesh Sir** and **Piyush Sir** personas
- Separate chat histories per persona (messages are not shared when switching)
- Client-side message storage (max 6 messages, cleared on page refresh)
- Input limited to 500 characters; output capped via `max_tokens: 500`
- **New Chat** clears all messages and prompts persona selection again
- Extensible system prompts (`lib/PROMPT.ts`) and OpenAI tools (`lib/tools.ts`)

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router)
- [React 19](https://react.dev) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [TanStack Query v5](https://tanstack.com/query)
- [OpenAI Node SDK](https://github.com/openai/openai-node)

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
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key for chat completions |

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

## Usage

1. Open the app and **choose a persona** (Hitesh Sir or Piyush Sir).
2. Type a message (up to 500 characters) and click **Send**.
3. Switch personas using the header toggle — each persona keeps its own history.
4. Click **New Chat** to clear all messages and pick a persona again.

Messages are stored in memory only and reset when you refresh the page.

## Project structure

```
assignment-1/
├── app/
│   ├── api/chat/route.ts    # OpenAI chat API route
│   ├── layout.tsx           # Root layout + providers
│   └── page.tsx             # Chat UI (persona picker, messages, composer)
├── lib/
│   ├── PROMPT.ts            # System prompts per persona (you write these)
│   ├── tools.ts             # OpenAI tool definitions (you write these)
│   └── types.ts             # Shared types and limits
└── .env.local               # Local secrets (not committed)
```

## API

**POST** `/api/chat`

Request body:

```json
{
  "persona": "hitesh",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ]
}
```

Response:

```json
{
  "content": "Assistant reply..."
}
```

## Available scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
