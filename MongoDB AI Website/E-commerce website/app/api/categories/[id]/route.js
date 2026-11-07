import connectDB from "@/app/lib/db";
import Category from "@/app/models/Category";
import Product from "@/app/models/Product";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function DELETE(request, context) {
  try {
    await connectDB();

    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Category ID format" },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "category not found." },
        { status: 404 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" It has been deleted from the database!`,
    });
  } catch (error) {
    console.error("Category DELETE Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while deleting the category.", error: error.message },
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
        { success: false, message: "Invalid Category ID format" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required." },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not Found" },
        { status: 404 }
      );
    }

    const oldName = category.name;
    const newName = name.trim();

    category.name = newName;
    category.slug = newName.toLowerCase().replace(/\s+/g, "-");
    await category.save();

    // Also update any products that had the old category name
    await Product.updateMany(
      { category: oldName },
      { $set: { category: newName } }
    );

    return NextResponse.json({
      success: true,
      message: `Category "${oldName}" name "${newName}" updated`,
      category,
    });
  } catch (error) {
    console.error("Category PUT Error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while updating category.", error: error.message },
      { status: 500 }
    );
  }
}

