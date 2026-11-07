import Product from "@/app/models/Product";
import { openai, isValidOpenAIKey } from "@/app/lib/openai";

let isEmbeddingInProgress = false;

/**
 * Automatically generates OpenAI vector embeddings in the background
 * without blocking API requests or requiring any user action on frontend.
 */
export async function autoGenerateEmbeddingsIfNeeded() {
  if (isEmbeddingInProgress) return;
  if (!isValidOpenAIKey()) return;

  try {
    // Check if there are any products missing embeddings
    const countWithoutEmbeddings = await Product.countDocuments({
      $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
    });

    if (countWithoutEmbeddings === 0) return;

    isEmbeddingInProgress = true;
    console.log(`[AutoEmbed] Background sync: generating embeddings for ${countWithoutEmbeddings} products...`);

    const products = await Product.find({
      $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }],
    }).limit(50);

    const inputs = products.map((p) =>
      `${p.title} | Category: ${p.category} | Description: ${p.description}`.replace(/\n+/g, " ")
    );

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: inputs,
    });

    const updatePromises = products.map((product, idx) => {
      product.embedding = response.data[idx].embedding;
      return product.save();
    });

    await Promise.all(updatePromises);
    console.log(`[AutoEmbed] Successfully generated and stored embeddings for ${products.length} products!`);
  } catch (err) {
    console.error("[AutoEmbed] Background embedding generation failed:", err.message);
  } finally {
    isEmbeddingInProgress = false;
  }
}

