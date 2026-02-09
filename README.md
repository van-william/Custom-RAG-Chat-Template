This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Core Data Flow 🧠

Understanding how knowledge flows into the system:

1.  **Transcripts** (`transcripts` table): Raw text input (chats, emails, docs).
2.  **Extraction**: LLM processes Transcripts into **Extracted Facts** (`extracted_facts`). These are "draft" knowledge items.
3.  **Approval**: Admin reviews Facts. Once approved & published, they become **Knowledge Documents** (`kb_documents`).
4.  **Indexing**: Documents are chunked and embedded into **Knowledge Chunks** (`kb_chunks`) for RAG retrieval.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about the template features, verify the `AGENTS.md` documentation.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
