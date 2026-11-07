import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { autoGenerateEmbeddingsIfNeeded } from "@/app/lib/autoEmbed";
import { generateSemanticVector } from "@/app/lib/vectorGenerator";
import { openai, isValidOpenAIKey } from "@/app/lib/openai";
import { NextResponse } from "next/server";

export async function GET(request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  console.log(`[API /api/products] Incoming GET request at ${new Date().toISOString()} from IP: ${ip}`);
  try {
    await connectDB();
    console.log(`[API /api/products] DB Connected, querying products...`);
    const products = await Product.find({}).select("-embedding").sort({ createdAt: -1 }).lean();
    console.log(`[API /api/products] Query success, returning ${products.length} products`);
    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("[API /api/products] Error:", error);
    console.error("Products API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch products.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { title, price, originalPrice, category, description, image, images, video } = body;

    if (!title?.trim() || !category?.trim() || !description?.trim()) {
      return NextResponse.json(
        { success: false, message: "Title, Category and Description must be entered." },
        { status: 400 }
      );
    }

    if (!price || Number(price) <= 0) {
      return NextResponse.json(
        { success: false, message: "Enter price in a positive number greater than zero." },
        { status: 400 }
      );
    }

    const cleanOriginalPrice =
      originalPrice && Number(originalPrice) > 0 ? Number(originalPrice) : 0;

    // Handle multiple images (max 5) & primary image
    let finalImages = [];
    if (Array.isArray(images) && images.length > 0) {
      finalImages = images.filter((img) => typeof img === "string" && img.trim().length > 0).slice(0, 5);
    } else if (image?.trim()) {
      finalImages = [image.trim()];
    }

    const defaultFallback =
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";

    const mainImageUrl = finalImages[0] || image?.trim() || defaultFallback;
    if (finalImages.length === 0) {
      finalImages = [mainImageUrl];
    }

    // 1. Generate 1536-dimensional semantic vector embedding
    let embedding = [];
    const semanticText = `${title.trim()} | Category: ${category.trim()} | Description: ${description.trim()}`;

    if (isValidOpenAIKey()) {
      try {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: semanticText,
        });
        embedding = response.data[0].embedding;
      } catch (err) {
        console.warn("OpenAI API call failed, using high-quality local semantic vector:", err.message);
        embedding = generateSemanticVector(semanticText);
      }
    } else {
      embedding = generateSemanticVector(semanticText);
    }

    // 2. Create Product in MongoDB
    const newProduct = await Product.create({
      title: title.trim(),
      price: Number(price),
      originalPrice: cleanOriginalPrice,
      category: category.trim(),
      description: description.trim(),
      image: mainImageUrl,
      images: finalImages,
      video: video?.trim() || "",
      embedding,
      reviews: [],
    });

    return NextResponse.json({
      success: true,
      message: `Product "${newProduct.title}" added`,
      product: newProduct,
    });
  } catch (error) {
    console.error("Product POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Error", error: error.message },
      { status: 500 }
    );
  }
}
