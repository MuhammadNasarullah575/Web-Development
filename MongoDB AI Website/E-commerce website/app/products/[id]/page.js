import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import mongoose from "mongoose";
import Link from "next/link";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-gray-900">Invalid Product Link</h2>
        <p className="text-gray-500 mt-2">Invalid product ID format.</p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  await connectDB();

  const productDoc = await Product.findById(id).select("-embedding").lean();

  if (!productDoc) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-4">📦</div>
        <h2 className="text-2xl font-bold text-gray-900">Product not Found</h2>
        <p className="text-gray-500 mt-2 max-w-md">
          Not Found
        </p>
        <Link
          href="/"
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md transition"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  // Fetch 4 related products in the same category
  const relatedDocs = await Product.find({
    category: productDoc.category,
    _id: { $ne: productDoc._id },
  })
    .limit(4)
    .select("-embedding")
    .lean();

  // Next.js client component serialization
  const serializedReviews = (productDoc.reviews || []).map((rev) => ({
    _id: rev._id ? rev._id.toString() : String(Math.random()),
    author: rev.author || "Anonymous",
    rating: Number(rev.rating) || 5,
    comment: rev.comment || "",
    verified: rev.verified !== false,
    createdAt:
      rev.createdAt instanceof Date
        ? rev.createdAt.toISOString()
        : rev.createdAt
        ? new Date(rev.createdAt).toISOString()
        : new Date().toISOString(),
  }));

  const product = {
    ...productDoc,
    _id: productDoc._id.toString(),
    createdAt: productDoc.createdAt?.toISOString?.() || null,
    updatedAt: productDoc.updatedAt?.toISOString?.() || null,
    reviews: serializedReviews,
  };

  const relatedProducts = relatedDocs.map((item) => ({
    ...item,
    _id: item._id.toString(),
    createdAt: item.createdAt?.toISOString?.() || null,
    updatedAt: item.updatedAt?.toISOString?.() || null,
    reviews: Array.isArray(item.reviews)
      ? item.reviews.map((r) => ({
          ...r,
          _id: r._id ? r._id.toString() : null,
          createdAt: r.createdAt ? (r.createdAt.toISOString?.() || String(r.createdAt)) : null,
        }))
      : [],
  }));

  return <ProductDetailClient product={product} relatedProducts={relatedProducts} />;
}
