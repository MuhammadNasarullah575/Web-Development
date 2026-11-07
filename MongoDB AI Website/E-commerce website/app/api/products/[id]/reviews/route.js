import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request, context) {
  try {
    await connectDB();

    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { author, rating, comment } = body;

    if (!author?.trim() || !comment?.trim()) {
      return NextResponse.json(
        { success: false, message: "Name aur review comment must be entered" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    const newReview = {
      author: author.trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      comment: comment.trim(),
      verified: true,
      createdAt: new Date(),
    };

    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    product.reviews.unshift(newReview);
    await product.save();

    return NextResponse.json({
      success: true,
      message: "Review saved successfully",
      review: {
        ...newReview,
        createdAt: newReview.createdAt.toISOString(),
      },
      totalReviews: product.reviews.length,
    });
  } catch (error) {
    console.error("Save review error:", error);
    return NextResponse.json(
      { success: false, message: "Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request, context) {
  try {
    await connectDB();
    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const product = await Product.findById(id).select("reviews");
    return NextResponse.json({
      success: true,
      reviews: product?.reviews || [],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

