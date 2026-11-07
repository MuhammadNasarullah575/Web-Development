import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { getEmbedding, cosineSimilarity } from "@/app/lib/openai";
import { generateSemanticVector } from "@/app/lib/vectorGenerator";
import { NextResponse } from "next/server";

function isValidKey() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return false;
  if (key.includes("YOUR_ACTUAL_KEY_HERE") || key.includes("your_openai")) return false;
  if (!key.startsWith("sk-")) return false;
  return key.trim().length > 20;
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";

    // If query is empty, return all products
    if (!query) {
      const all = await Product.find({}).select("-embedding").sort({ createdAt: -1 });
      return NextResponse.json({
        success: true,
        count: all.length,
        type: "all",
        products: all,
      });
    }

    // Generate 1536-dimensional semantic vector for the query
    let queryEmbedding = null;

    if (isValidKey()) {
      try {
        queryEmbedding = await getEmbedding(query);
      } catch (e) {
        console.warn("OpenAI API call failed, using high-dimensional local semantic generator:", e.message);
      }
    }

    // Fallback to local 1536-dimensional semantic generator if OpenAI key not valid
    if (!queryEmbedding) {
      queryEmbedding = generateSemanticVector(query, 1536);
    }

    // Fetch products from database that have embeddings
    const products = await Product.find({
      embedding: { $exists: true, $not: { $size: 0 } },
    });

    if (products.length > 0 && queryEmbedding) {
      // Calculate Cosine Similarity with each product
      const scoredProducts = products
        .map((product) => {
          const similarity = cosineSimilarity(queryEmbedding, product.embedding);
          return {
            _id: product._id,
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            image: product.image,
            similarityScore: Math.round(similarity * 100),
            rawSimilarity: similarity,
          };
        })
        // Similarity threshold: matches over 0.25
        .filter((item) => item.rawSimilarity >= 0.25)
        .sort((a, b) => b.rawSimilarity - a.rawSimilarity);

      if (scoredProducts.length > 0) {
        return NextResponse.json({
          success: true,
          type: "vector-semantic",
          query,
          count: scoredProducts.length,
          products: scoredProducts,
        });
      }
    }

    // Fallback: Agar koi vector match na miley tou keyword/text regex fallback
    const regex = new RegExp(query, "i");
    const keywordResults = await Product.find({
      $or: [{ title: regex }, { description: regex }, { category: regex }],
    }).select("-embedding");

    return NextResponse.json({
      success: true,
      type: "keyword-fallback",
      query,
      count: keywordResults.length,
      products: keywordResults,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Search error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
