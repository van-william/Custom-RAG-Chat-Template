/**
 * Simple utility to split text into chunks for RAG.
 * For MVP, we split by paragraphs (double newlines) and then join them back up 
 * to fit a target character length (e.g. 1000 chars) with some overlap.
 */
export function chunkText(text: string, maxChunkSize = 1000, overlap = 100): string[] {
    if (!text) return [];

    // 1. Split by paragraphs first to respect semantic boundaries
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const paragraph of paragraphs) {
        // If adding this paragraph exceeds max size, push current chunk and start new
        if (currentChunk.length + paragraph.length + 2 > maxChunkSize) {
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }

            // If the paragraph itself is massive, we might force split it (simple slice for MVP)
            // or just start the new chunk with it. 
            // For now, we'll just set it as the new start (overlap logic omitted for simplicity in MVP)
            currentChunk = paragraph;
        } else {
            if (currentChunk) {
                currentChunk += "\n\n" + paragraph;
            } else {
                currentChunk = paragraph;
            }
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}
