import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { generateSemanticVector } from "@/app/lib/vectorGenerator";
import { openai, isValidOpenAIKey } from "@/app/lib/openai";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request, context) {
  try {
    await connectDB();

    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Product ID format" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id).select("-embedding");

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // Related products in the same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .select("-embedding");

    return NextResponse.json({
      success: true,
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error("Single Product API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    await connectDB();

    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Product ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, price, originalPrice, category, description, image, images, video } = body;

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (title !== undefined) existingProduct.title = title.trim();
    if (price !== undefined) existingProduct.price = Number(price);
    if (originalPrice !== undefined) {
      existingProduct.originalPrice = Number(originalPrice) > 0 ? Number(originalPrice) : 0;
    }
    if (category !== undefined) existingProduct.category = category.trim();
    if (description !== undefined) existingProduct.description = description.trim();

    if (images !== undefined && Array.isArray(images)) {
      const cleanImages = images
        .filter((img) => typeof img === "string" && img.trim().length > 0)
        .slice(0, 5);
      existingProduct.images = cleanImages;
      if (cleanImages.length > 0) {
        existingProduct.image = cleanImages[0];
      }
    } else if (image !== undefined && image.trim()) {
      existingProduct.image = image.trim();
      if (!existingProduct.images || existingProduct.images.length === 0) {
        existingProduct.images = [image.trim()];
      } else {
        existingProduct.images[0] = image.trim();
      }
    }

    if (video !== undefined) existingProduct.video = video.trim();

    // Re-generate semantic embedding if title, category, or description changed
    const semanticText = `${existingProduct.title} | Category: ${existingProduct.category} | Description: ${existingProduct.description}`;

    if (isValidOpenAIKey()) {
      try {
        const response = await openai.embeddings.create({
          model: "text-embedding-3-small",
          input: semanticText,
        });
        existingProduct.embedding = response.data[0].embedding;
      } catch (err) {
        existingProduct.embedding = generateSemanticVector(semanticText);
      }
    } else {
      existingProduct.embedding = generateSemanticVector(semanticText);
    }

    await existingProduct.save();

    return NextResponse.json({
      success: true,
      message: `Product "${existingProduct.title}" updated successfully!`,
      product: existingProduct,
    });
  } catch (error) {
    console.error("Product PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "Error!", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectDB();

    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Product ID format" },
        { status: 400 }
      );
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Product "${deletedProduct.title}" deleted.`,
    });
  } catch (error) {
    console.error("Product DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "Error", error: error.message },
      { status: 500 }
    );
  }
}
