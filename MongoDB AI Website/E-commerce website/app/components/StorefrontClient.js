"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";

export default function StorefrontClient({ initialProducts = [], initialCategories = [] }) {
  // Initialize with server-fetched products (Instant zero-wait display)
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dbCategories, setDbCategories] = useState(
    initialCategories && initialCategories.length > 0
      ? ["All", ...initialCategories]
      : [
          "All",
          "Footwear",
          "Electronics",
          "Accessories",
          "Clothing",
          "Home & Living",
          "Kitchen",
          "Sports & Fitness",
          "Beauty",
          "Stationery",
        ]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [toastMessage, setToastMessage] = useState("");

  // Global Cart Context
  const {
    addToCart,
    totalItems,
    totalPieces,
    setIsCartOpen,
    setIsTrackOrderOpen,
    setIsChatOpen,
    chatUnreadCount,
  } = useCart();

  // Reset or reload products
  const fetchAllProducts = async () => {
    setActiveSearch("");
    setSearchQuery("");
    setSelectedCategory("All");
    
    // If we already have initial products, restore them immediately
    if (initialProducts.length > 0 && products.length === 0) {
      setProducts(initialProducts);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load products from server.");
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.products || [];
      setProducts(list.length > 0 ? list : initialProducts);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing products:", err);
      if (initialProducts.length > 0) {
        setProducts(initialProducts);
      } else {
        setError(err.message || "Failed to load products.");
      }
      setLoading(false);
    }
  };

  // Smart Search: Vector Semantic Search
  const handleSearch = async (queryText) => {
    const q = queryText !== undefined ? queryText : searchQuery;
    if (!q.trim()) {
      fetchAllProducts();
      return;
    }

    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
        setActiveSearch(q.trim());
        setSelectedCategory("All");
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add 1 single item from main page card
  const handleAddSingleItem = (e, product) => {
    e.preventDefault();
    e.stopPropagation(); // Prevents navigating to product detail
    addToCart(product, 1);
    setToastMessage(`"${product.title}" added to cart`);
    setTimeout(() => setToastMessage(""), 2200);
  };

  // Filtered & Sorted products
  const displayProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (selectedCategory === "All") return true;
        return product.category?.toLowerCase() === selectedCategory.toLowerCase();
      })
      .sort((a, b) => {
        if (activeSearch && sortBy === "default") {
          return (b.similarityScore || 0) - (a.similarityScore || 0);
        }
        if (sortBy === "low-to-high") return a.price - b.price;
        if (sortBy === "high-to-low") return b.price - a.price;
        return 0;
      });
  }, [products, selectedCategory, sortBy, activeSearch]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-gray-50 text-gray-900 flex flex-col font-sans min-w-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 w-full max-w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs min-w-0 transition-shadow">
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          {/* Brand Logo */}
          <div
            onClick={fetchAllProducts}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 text-base sm:text-lg">
              🛒
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                StoreZen
              </span>
            </div>
          </div>

          {/* Search Form in Navbar (Desktop) */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex-1 max-w-lg hidden md:flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products (e.g. bag, shoes, headphones)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 focus:bg-white text-sm rounded-xl pl-10 pr-4 py-2 border border-transparent focus:border-blue-500 focus:outline-hidden transition"
              />
              <svg
                className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {searchLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Search"
              )}
            </button>
          </form>

          {/* Header Right Actions: Track Order & Cart */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Track Order Button */}
            <button
              type="button"
              onClick={() => setIsTrackOrderOpen(true)}
              className="touch-manipulation flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition cursor-pointer border border-gray-200 hover:border-blue-200 shadow-2xs group active:scale-95"
              title="Track your order status"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="hidden sm:inline">Track Your Order</span>
              <span className="sm:hidden">Track</span>
            </button>

            {/* Messages / Chat Icon next to Cart */}
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="touch-manipulation relative p-2 sm:p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-blue-600 cursor-pointer transition flex items-center gap-1 group border border-transparent hover:border-gray-200 active:scale-95"
              title="Customer Support & Order Chat"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>

              {/* Unread Messages Counter Badge */}
              {chatUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] sm:text-[11px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md animate-bounce pointer-events-none">
                  {chatUnreadCount}
                </span>
              )}
            </button>

            {/* Cart Icon in Navbar - Click to Open Drawer */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="touch-manipulation relative p-2 sm:p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer transition flex items-center gap-1.5 group active:scale-95"
              title="Open Shopping Cart"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>

              {/* Unique items badge */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] sm:text-[11px] font-extrabold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md animate-pulse pointer-events-none">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Only on phones & small tablets) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="p-2 sm:p-2.5 md:hidden border-t border-gray-100 flex gap-1.5 sm:gap-2 bg-gray-50/70"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-xs rounded-xl pl-8 pr-3 py-1.5 border border-gray-200 focus:border-blue-500 focus:outline-hidden"
            />
            <svg
              className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shrink-0 cursor-pointer flex items-center justify-center"
          >
            {searchLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Search"
            )}
          </button>
        </form>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-full overflow-hidden bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-transparent border-b border-gray-100 py-5 sm:py-10 px-2.5 sm:px-6 lg:px-8 text-center min-w-0">
        <div className="w-full max-w-4xl mx-auto min-w-0">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Explore Quality Products
          </h1>
          <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-sm md:text-base text-gray-600 max-w-xl mx-auto">
            Click on any product to view full details, customer reviews, discount pricing, and easy cash on delivery.
          </p>

          {/* Category Tabs (Horizontal Touch Swipe on Mobile, Wrapped on Desktop) */}
          <div className="mt-3.5 sm:mt-6 w-full max-w-full overflow-x-auto no-scrollbar touch-scroll flex items-center gap-1.5 sm:gap-2 px-1 pb-1 sm:flex-wrap sm:justify-center min-w-0">
            {dbCategories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-8 min-w-0">
        {/* Active Search & Status Bar */}
        <div className="w-full min-w-0 flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200 mb-3.5 sm:mb-6 gap-1.5 sm:gap-2">
          <div className="min-w-0">
            {activeSearch ? (
              <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm">
                <span className="text-gray-600 truncate">
                  Results for: <strong className="text-gray-900">"{activeSearch}"</strong>
                </span>
                <button
                  type="button"
                  onClick={fetchAllProducts}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer shrink-0"
                >
                  Clear ✕
                </button>
              </div>
            ) : (
              <div className="text-[11px] sm:text-xs md:text-sm text-gray-500 truncate">
                Showing <span className="font-bold text-gray-900">{displayProducts.length}</span> products
                {selectedCategory !== "All" && (
                  <span className="ml-1 text-blue-600 font-medium">in "{selectedCategory}"</span>
                )}
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 shrink-0">
            <label className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
              Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 text-xs sm:text-sm rounded-lg sm:rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 focus:outline-hidden focus:border-blue-500 cursor-pointer shadow-2xs font-medium"
            >
              <option value="default">Best Match</option>
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {(loading || searchLoading) && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-9 sm:w-12 h-9 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-500 font-medium text-xs sm:text-sm">
              {searchLoading ? "Searching products..." : "Loading products..."}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-md mx-auto p-4 sm:p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 my-6">
            <p className="font-bold text-sm sm:text-base mb-1">Error Loading Products</p>
            <p className="text-xs sm:text-sm text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchAllProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 cursor-pointer shadow-xs transition"
            >
              🔄 Retry (Dobara Koshish Karein)
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !searchLoading && displayProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 p-6 sm:p-8">
            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3">🔍</div>
            <h3 className="text-base sm:text-xl font-bold text-gray-800">No Products Found</h3>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              We couldn't find any products matching "{activeSearch}". Try searching for something else.
            </p>
            <button
              type="button"
              onClick={fetchAllProducts}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 cursor-pointer"
            >
              View All Products
            </button>
          </div>
        )}

        {/* Products Grid: 2 Columns on mobile (Android/iPhone), 3 on tablet, 4 on desktop */}
        {!loading && !searchLoading && displayProducts.length > 0 && (
          <div className="w-full min-w-0 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            {displayProducts.map((product) => {
              const hasDiscount =
                product.originalPrice &&
                Number(product.originalPrice) > Number(product.price);
              const discountPct = hasDiscount
                ? Math.round(
                    ((Number(product.originalPrice) - Number(product.price)) /
                      Number(product.originalPrice)) *
                      100
                  )
                : 0;

              return (
                <div
                  key={product._id}
                  className="w-full min-w-0 bg-white rounded-xl sm:rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group select-none"
                >
                  {/* Clickable Image -> navigates to Product Detail */}
                  <Link
                    href={`/products/${product._id}`}
                    className="block relative aspect-square w-full bg-gray-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
                      }}
                    />

                    {/* Discount Badge (Top Right) */}
                    {hasDiscount && (
                      <span className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 bg-red-600 text-white text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 z-10">
                        <span>🔥</span> -{discountPct}%
                      </span>
                    )}

                    {/* Media Indicators (Bottom Corners) */}
                    <div className="absolute bottom-1.5 inset-x-1.5 flex items-center justify-between pointer-events-none z-10">
                      {Array.isArray(product.images) && product.images.length > 1 ? (
                        <span className="bg-black/75 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                          <span>📷</span> {product.images.length}
                        </span>
                      ) : <span></span>}

                      {product.video && (
                        <span className="bg-black/75 backdrop-blur-xs text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs ml-auto">
                          <span>▶</span> Video
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-2 sm:p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Category Label */}
                      <span className="text-[9px] sm:text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block truncate mb-0.5">
                        {product.category || "General"}
                      </span>

                      {/* Product Title (Clickable link to detail) */}
                      <Link
                        href={`/products/${product._id}`}
                        className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 sm:line-clamp-2 text-xs sm:text-sm md:text-base leading-snug cursor-pointer block"
                      >
                        {product.title}
                      </Link>

                      {/* Description (desktop/tablet only) */}
                      <p className="mt-1 text-[11px] sm:text-xs text-gray-500 line-clamp-1 leading-relaxed hidden md:block">
                        {product.description}
                      </p>
                    </div>

                    {/* Pricing & Add to Cart */}
                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col">
                      <div>
                        <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold block uppercase tracking-wider">
                          {hasDiscount ? "Special Price" : "Price"}
                        </span>
                        <div className="flex items-baseline gap-1 flex-wrap">
                          <span className="text-xs sm:text-base md:text-lg font-black text-gray-900">
                            Rs. {product.price?.toLocaleString()}
                          </span>
                          {hasDiscount && (
                            <span className="text-[9px] sm:text-xs text-gray-400 line-through font-semibold">
                              Rs. {Number(product.originalPrice).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Add to Cart Button (Completely independent from any Link tag) */}
                      <button
                        type="button"
                        onClick={(e) => handleAddSingleItem(e, product)}
                        className="touch-manipulation w-full mt-2 py-1.5 sm:py-2 px-2 sm:px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[10px] sm:text-xs font-bold rounded-lg sm:rounded-xl transition duration-150 shadow-2xs hover:shadow-xs cursor-pointer flex items-center justify-center gap-1 z-10"
                      >
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-500 space-y-2">
        <p className="flex items-center justify-center gap-2 text-gray-700 font-semibold">
          <span>💬 WhatsApp Support:</span>
          <a
            href="https://wa.me/923233937672?text=Hello%20StoreZen%21%20I%20have%20a%20query."
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:text-emerald-700 hover:underline font-bold"
          >
            0323-3937672
          </a>
        </p>
        <p>© 2026 StoreZen E-Commerce. All rights reserved.</p>
      </footer>
    </div>
  );
}

