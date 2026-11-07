import connectDB from "@/app/lib/db";
import Category from "@/app/models/Category";
import Product from "@/app/models/Product";
import { NextResponse } from "next/server";

const DEFAULT_CATEGORIES = [
  "Footwear",
  "Electronics",
  "Accessories",
  "Clothing",
  "Home & Living",
  "Kitchen",
  "Sports & Fitness",
  "Beauty",
  "Stationery",
];

export async function GET() {
  try {
    await connectDB();

    let categories = await Category.find({}).sort({ name: 1 }).lean();

    // Auto-seed if collection is empty
    if (!categories || categories.length === 0) {
      // Find all distinct categories from products if available, or use defaults
      const productCategories = await Product.distinct("category");
      const seedList = productCategories.length > 0 ? productCategories : DEFAULT_CATEGORIES;

      const docsToInsert = seedList.map((cat) => ({
        name: cat.trim(),
        slug: cat.trim().toLowerCase().replace(/\s+/g, "-"),
      }));

      await Category.insertMany(docsToInsert, { ordered: false }).catch(() => {});
      categories = await Category.find({}).sort({ name: 1 }).lean();
    }

    // Fast aggregation for product count per category in a single MongoDB query
    const counts = await Product.aggregate([
      { $group: { _id: { $toLower: "$category" }, count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      if (c._id) countMap[c._id] = c.count;
    });

    const categoriesWithCounts = categories.map((cat) => ({
      ...cat,
      productCount: countMap[cat.name?.toLowerCase()] || 0,
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithCounts,
    });
  } catch (error) {
    console.error("Categories GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching categories.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name be entered" },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    const slug = trimmedName.toLowerCase().replace(/\s+/g, "-");

    // Check if exists
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Category "${trimmedName}" already exist.` },
        { status: 400 }
      );
    }

    const newCategory = await Category.create({
      name: trimmedName,
      slug,
      description: description || "",
    });

    return NextResponse.json({
      success: true,
      message: `Category "${newCategory.name}" successfully added`,
      category: {
        ...newCategory.toObject(),
        productCount: 0,
      },
    });
  } catch (error) {
    console.error("Category POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Error!", error: error.message },
      { status: 500 }
    );
  }
}

