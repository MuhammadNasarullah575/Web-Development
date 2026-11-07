import OpenAI from "openai";

export function isValidOpenAIKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return false;
  if (key.includes("YOUR_ACTUAL_KEY_HERE") || key.includes("your_openai")) return false;
  if (!key.startsWith("sk-")) return false;
  return key.trim().length > 20;
}

export const openai = new OpenAI({
  apiKey: isValidOpenAIKey() ? process.env.OPENAI_API_KEY : "dummy-key-offline",
});

/**
 * Generate a 1536-dimensional vector embedding for a given text
 */
export async function getEmbedding(text) {
  if (!isValidOpenAIKey()) {
    return null;
  }

  const cleanText = text.replace(/\n+/g, " ").trim();

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: cleanText,
  });

  return response.data[0].embedding;
}

/**
 * Calculate Cosine Similarity between two numeric vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  if (vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
