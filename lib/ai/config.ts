import { google } from '@ai-sdk/google';

// Centralized model configuration for easy swapping
// To switch providers (e.g. to OpenAI), simply change the imports and model strings here.

// Chat Model: Used for generating responses
// Using gemini-2.5-flash (stable June 2025) - best price/performance
export const chatModel = google('gemini-2.5-flash');

// Embedding Model Configuration:
// Embeddings are now generated via direct Google API calls in lib/ai/embedding.ts
// This bypasses the Vercel AI SDK to enable outputDimensionality configuration.
// Model: gemini-embedding-001, Dimensions: 768
// See: embedTextWithGoogle() and embedTextsWithGoogle() functions
