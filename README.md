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

## Configuration & Seeding

### 1. Database Schema
The template uses a generic "List A" and "List B" structure to organize your knowledge base:
- **List A**: Categories, Groups, or Parent Entities (e.g., Neighborhoods, Departments, Topics).
- **List B**: Items, Products, or Child Entities (e.g., Listings, Articles, Employees).

You can rename these concepts in the UI source code (`app/admin/lists/page.tsx`) to match your domain.

### 2. Seeding Data
The `supabase/seed.sql` file contains:
- Default system prompts for the AI agents.
- **Sample Data**: An example "Category" and "Item" to demonstrate the structure.

To reset and seed your database:
```bash
npx supabase db reset
```

### 3. Environment Variables
Copy `.env.local.example` to `.env.local` and fill in your keys:
- **Supabase**: URL and Anon Key.
- **Clerk**: Publishable and Secret Keys.
- **Google Generative AI**: API Key for embeddings and chat.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Making it Your Own 🛠️

Here is a quick checklist to turn this template into your app:

1.  **Domain Modeling**:
    -   Decide what your `List A` (Categories) and `List B` (Items) are.
    -   Update the UI labels in `app/admin/lists/page.tsx`.
    -   (Optional) If you don't need lists, you can rely solely on global documents.

2.  **Branding**:
    -   Update the Landing Page: `app/page.tsx`.
    -   Update the Navbar/Footer: `app/layout.tsx` (or components within `page.tsx`).
    -   Update Metadata: `app/layout.tsx` (title, description).

3.  **AI Personality**:
    -   Go to `/admin/prompts` and edit the `user_chat_system` prompt.
    -   Give your agent a name and specific instructions about its role.

4.  **Knowledge Base**:
    -   Clear the sample data (`npx supabase db reset`).
    -   Use the **Transcript Ingestion** (`/admin/transcripts`) to upload raw data (FAQs, interviews, docs).
    -   The system will extract facts and you can approve them into your knowledge base.

## Learn More

To learn more about the template features, verify the `AGENTS.md` documentation.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
