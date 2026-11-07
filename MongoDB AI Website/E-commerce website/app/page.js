import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import Category from "@/app/models/Category";
import StorefrontClient from "./components/StorefrontClient";

export default async function HomePage() {
  let initialProducts = [];
  let initialCategories = [];

  try {
    await connectDB();

    const [rawProducts, rawCategories] = await Promise.all([
      Product.find({})
        .select("-embedding")
        .sort({ createdAt: -1 })
        .lean(),
      Category.find({})
        .sort({ name: 1 })
        .lean(),
    ]);

    initialProducts = rawProducts.map((p) => ({
      ...p,
      _id: p._id.toString(),
      createdAt: p.createdAt ? p.createdAt.toISOString() : null,
      updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
      reviews: Array.isArray(p.reviews)
        ? p.reviews.map((r) => ({
            ...r,
            _id: r._id ? r._id.toString() : null,
            createdAt: r.createdAt ? r.createdAt.toISOString() : null,
          }))
        : [],
    }));

    initialCategories = rawCategories.map((c) => c.name);
  } catch (err) {
    console.error("HomePage SSR load error:", err);
  }

  return (
    <StorefrontClient
      initialProducts={initialProducts}
      initialCategories={initialCategories}
    />
  );
}
