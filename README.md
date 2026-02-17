# AI Coding Boilerplate

This is a starter project for building a product with an AI assistant.

## Requirements

You need Node.js (includes npm). Download here:

```
https://nodejs.org/en/download/
```

## The Simple Way to Start

1. Tell the agent: `Start`
2. Answer the questions.
3. Run this command:

```bash
npm run ai:start
```

Open `http://localhost:3000`.

## If You Prefer a Guided Setup in the Terminal

```bash
npm run ai:specify
```

This asks the same questions and fills the project details for you.

After that, you can run everything with one command:

```bash
npm run ai:start
```

During setup, it replaces `AI Coding Boilerplate` with your project name
and reinitializes git for a fresh repository (if git is installed).

## What You Will Edit (One Time)

- `.docs/project/specialization.md`  
  This is your project description. The agent fills it.

Optional (only if you want a brand or design work):

- `.docs/project/brand.md`  
  This is the visual/brand brief.

## If You Want Design Assets (Optional)

Set up your API key:

1. Copy `.env.example` to `.env`
2. Add `OPENAI_API_KEY`

Example command:

```bash
npm run design:logo -- --prompt "Minimal geometric logo" --name logo-v1
```

Design files are saved in `public/assets/img/`.

## Where Things Go

- Feature specs live in `.features/` (see `example.feature.md`)
- Agent instructions are in `AGENT.md` and `CLAUDE.md`

## Troubleshooting

If you see placeholder errors, run:

```bash
npm run ai:check-specialization
```
