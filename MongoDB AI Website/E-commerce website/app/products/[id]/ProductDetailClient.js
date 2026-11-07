"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "../../context/CartContext";
import { PAKISTAN_CITIES, validatePakistaniPhone } from "../../lib/pakistanLocations";
import BankPaymentSection from "../../components/BankPaymentSection";

// Helper function for accurate relative time
function formatRelativeTime(dateInput) {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return "Just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "Just now";

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin === 1) return "1 minute ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) return "1 week ago";
  if (diffWeeks < 4) return `${diffWeeks} weeks ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "1 month ago";
  if (diffMonths < 12) return `${diffMonths} months ago`;

  const diffYears = Math.floor(diffDays / 365);
  return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
}

export default function ProductDetailClient({ product = {}, relatedProducts = [] }) {
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState("");
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isPlacingBuyNow, setIsPlacingBuyNow] = useState(false);
  const [placedBuyNowOrderNo, setPlacedBuyNowOrderNo] = useState("");
  const [buyNowPhoneError, setBuyNowPhoneError] = useState("");
  const [buyNowCustomer, setBuyNowCustomer] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    selectedCity: "Lahore",
    customCity: "",
    district: "",
    sectorStreet: "",
  });

  // Direct Buy Now Payment States
  const [buyNowPaymentMethod, setBuyNowPaymentMethod] = useState("Cash on Delivery");
  const [buyNowTransactionId, setBuyNowTransactionId] = useState("");
  const [buyNowPaymentReceipt, setBuyNowPaymentReceipt] = useState("");
  const [buyNowPaymentBank, setBuyNowPaymentBank] = useState("Meezan Bank");

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

  // Full media gallery (up to 5 images + optional video)
  const allImages = useMemo(() => {
    if (Array.isArray(product?.images) && product.images.length > 0) {
      return product.images;
    }
    return product?.image ? [product.image] : [];
  }, [product?.images, product?.image]);

  const hasVideo = Boolean(product?.video);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isVideoSelected, setIsVideoSelected] = useState(false);

  const totalGalleryItems = allImages.length + (hasVideo ? 1 : 0);

  const handleNextMedia = () => {
    if (isVideoSelected) {
      setIsVideoSelected(false);
      setSelectedImageIndex(0);
    } else if (selectedImageIndex < allImages.length - 1) {
      setSelectedImageIndex((prev) => prev + 1);
    } else if (hasVideo) {
      setIsVideoSelected(true);
    } else {
      setSelectedImageIndex(0);
    }
  };

  const handlePrevMedia = () => {
    if (isVideoSelected) {
      setIsVideoSelected(false);
      setSelectedImageIndex(allImages.length - 1);
    } else if (selectedImageIndex > 0) {
      setSelectedImageIndex((prev) => prev - 1);
    } else if (hasVideo) {
      setIsVideoSelected(true);
    } else {
      setSelectedImageIndex(allImages.length - 1);
    }
  };

  // Reviews state initialized from MongoDB product.reviews
  const [reviews, setReviews] = useState(product?.reviews || []);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Review Form state
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Reviews dynamic calculation
  const totalReviewsCount = reviews.length;
  const avgRating =
    totalReviewsCount > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / totalReviewsCount).toFixed(1)
      : "5.0";
  const avgRatingRounded = Math.round(Number(avgRating));

  // Pricing calculations: only show discount if product.originalPrice is explicitly higher than price
  const price = Number(product?.price || 0);
  const dbOriginalPrice = Number(product?.originalPrice || 0);
  const hasDiscount = dbOriginalPrice > price;
  const originalPrice = hasDiscount ? dbOriginalPrice : 0;
  const discountAmount = hasDiscount ? originalPrice - price : 0;
  const discountPercent =
    hasDiscount && originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;

  // Add multiple pieces to cart
  const handleAddToCart = () => {
    addToCart(product, quantity);
    setToastMessage(`${quantity}x "${product?.title || "Item"}" added to cart`);
    setTimeout(() => setToastMessage(""), 2500);
  };

  const handleBuyNow = () => {
    setShowBuyModal(true);
    setOrderConfirmed(false);
    setPlacedBuyNowOrderNo("");
    setBuyNowPhoneError("");
  };

  const handleBuyNowPhoneChange = (val) => {
    setBuyNowCustomer({ ...buyNowCustomer, phone: val });
    if (buyNowPhoneError) {
      const check = validatePakistaniPhone(val);
      if (check.isValid) setBuyNowPhoneError("");
    }
  };

  const handleConfirmOrder = async (e) => {
    e.preventDefault();

    // 1. Phone validation
    const phoneCheck = validatePakistaniPhone(buyNowCustomer.phone);
    if (!phoneCheck.isValid) {
      setBuyNowPhoneError(phoneCheck.message);
      return;
    }
    setBuyNowPhoneError("");

    // 2. City validation
    const effectiveCity =
      buyNowCustomer.selectedCity === "Other"
        ? buyNowCustomer.customCity.trim()
        : buyNowCustomer.selectedCity;

    if (!effectiveCity) {
      alert("Enter your City name");
      return;
    }

    if (
      !buyNowCustomer.firstName.trim() ||
      !buyNowCustomer.lastName.trim() ||
      !buyNowCustomer.district.trim() ||
      !buyNowCustomer.sectorStreet.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    // 3. Bank Transfer validation
    if (buyNowPaymentMethod === "Bank Transfer / Raast QR") {
      if (!buyNowTransactionId.trim()) {
        alert("Please enter your Transaction ID (TID) from your bank app receipt.");
        return;
      }
      if (!buyNowPaymentReceipt.trim()) {
        alert("Please upload your payment screenshot / receipt slip.");
        return;
      }
    }

    const fullAddress = `${buyNowCustomer.sectorStreet.trim()}, District ${buyNowCustomer.district.trim()}, ${effectiveCity}`;

    setIsPlacingBuyNow(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: buyNowCustomer.firstName.trim(),
            lastName: buyNowCustomer.lastName.trim(),
            name: `${buyNowCustomer.firstName.trim()} ${buyNowCustomer.lastName.trim()}`,
            phone: phoneCheck.formatted || buyNowCustomer.phone.trim(),
            city: effectiveCity,
            district: buyNowCustomer.district.trim(),
            sectorStreet: buyNowCustomer.sectorStreet.trim(),
            address: fullAddress,
          },
          items: [
            {
              _id: product._id,
              title: product.title,
              price: price,
              quantity: quantity,
              image: product.image,
            },
          ],
          totalAmount: price * quantity,
          paymentMethod: buyNowPaymentMethod,
          transactionId:
            buyNowPaymentMethod === "Bank Transfer / Raast QR" ? buyNowTransactionId.trim() : "",
          paymentReceipt:
            buyNowPaymentMethod === "Bank Transfer / Raast QR" ? buyNowPaymentReceipt : "",
          paymentBank:
            buyNowPaymentMethod === "Bank Transfer / Raast QR" ? buyNowPaymentBank : "",
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        const orderPhone = phoneCheck.formatted || buyNowCustomer.phone.trim();
        const orderName = `${buyNowCustomer.firstName.trim()} ${buyNowCustomer.lastName.trim()}`.trim();
        try {
          localStorage.setItem("storezen_customer_phone", orderPhone);
          localStorage.setItem("storezen_customer_name", orderName);
        } catch (e) {}

        setPlacedBuyNowOrderNo(data.order.orderNumber);
        setOrderConfirmed(true);
        setTimeout(() => {
          setShowBuyModal(false);
          setOrderConfirmed(false);
          setToastMessage(`Order #${data.order.orderNumber} placed successfully!`);
          setTimeout(() => setToastMessage(""), 3500);
          setBuyNowTransactionId("");
          setBuyNowPaymentReceipt("");
          setBuyNowPaymentMethod("Cash on Delivery");
          setBuyNowCustomer({
            firstName: "",
            lastName: "",
            phone: "",
            selectedCity: "Lahore",
            customCity: "",
            district: "",
            sectorStreet: "",
          });
        }, 3200);
      } else {
        alert(data.message || "Error");
      }
    } catch (err) {
      console.error(err);
      alert("Error placing order. Please try again.");
    } finally {
      setIsPlacingBuyNow(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    setIsSubmittingReview(true);
    setReviewError("");

    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: newAuthor.trim(),
          rating: Number(newRating),
          comment: newComment.trim(),
        }),
      });

      const data = await res.json();

      if (data.success && data.review) {
        setReviews((prev) => [data.review, ...prev]);
        setNewAuthor("");
        setNewComment("");
        setNewRating(5);
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 3500);
      } else {
        setReviewError(data.message || "Error");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      setReviewError("Network error. Review not saved ");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-gray-50 text-gray-900 flex flex-col font-sans min-w-0">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce">
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full max-w-full bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-2xs min-w-0 transition-shadow">
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4 min-w-0">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 text-base sm:text-lg">
              🛒
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              StoreZen
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <Link
              href="/"
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 transition flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-50"
            >
              <span>←</span>
              <span className="hidden sm:inline">All Products</span>
              <span className="sm:hidden">Store</span>
            </Link>

            {/* Track Order Button */}
            <button
              type="button"
              onClick={() => setIsTrackOrderOpen(true)}
              className="touch-manipulation flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold text-gray-700 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition cursor-pointer border border-gray-200/80 hover:border-blue-200 shadow-2xs group active:scale-95"
              title="Track your order status"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <span className="hidden sm:inline">Track Your Order</span>
              <span className="sm:hidden">Track</span>
            </button>

            {/* Customer Chat Button */}
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="touch-manipulation relative p-2 sm:p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-blue-600 cursor-pointer transition flex items-center gap-1 group border border-transparent hover:border-gray-200 active:scale-95"
              title="Customer Support & Order Chat"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>

              {chatUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] sm:text-[11px] font-black rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md animate-bounce pointer-events-none">
                  {chatUnreadCount}
                </span>
              )}
            </button>

            {/* Clickable Cart Button in Navbar */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="touch-manipulation relative p-2 sm:p-2.5 rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer transition flex items-center gap-1.5 group active:scale-95"
              title="Open Shopping Cart"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] sm:text-[11px] font-extrabold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-md animate-pulse">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 min-w-0">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-gray-500 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-blue-600 transition shrink-0">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-700 font-medium shrink-0">{product?.category || "Category"}</span>
          <span>/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[150px] sm:max-w-xs md:max-w-md">
            {product?.title || "Product"}
          </span>
        </nav>

        {/* Product Overview Section (2 Column Grid) */}
        <div className="bg-white rounded-xl sm:rounded-3xl border border-gray-100 shadow-xs p-3 sm:p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-14">
          {/* Left Column: Multi-Image & Video Showcase Gallery */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Main Showcase Frame */}
            <div className="relative aspect-square w-full rounded-xl sm:rounded-3xl bg-black overflow-hidden border border-gray-100 group shadow-sm flex items-center justify-center">
              {isVideoSelected && hasVideo ? (
                <video
                  src={product.video}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={allImages[selectedImageIndex] || product?.image || ""}
                  alt={`${product?.title || "Product"} - View ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300 bg-white"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
                  }}
                />
              )}

              {/* Prev / Next Slider Arrows (shown if more than 1 media item) */}
              {totalGalleryItems > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevMedia}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md flex items-center justify-center font-bold text-base sm:text-lg cursor-pointer transition active:scale-95 z-20 opacity-85 hover:opacity-100"
                    title="Previous media"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMedia}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-gray-900 shadow-md flex items-center justify-center font-bold text-base sm:text-lg cursor-pointer transition active:scale-95 z-20 opacity-85 hover:opacity-100"
                    title="Next media"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Discount Tag */}
              {hasDiscount && discountPercent > 0 && !isVideoSelected && (
                <span className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 bg-red-600 text-white text-[10px] sm:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md uppercase tracking-wider z-10">
                  {discountPercent}% OFF
                </span>
              )}

              {/* Category Pill */}
              <span className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-xs text-gray-800 text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm z-10">
                {product?.category || "General"}
              </span>

              {/* Media Position Pill on Bottom Right */}
              {totalGalleryItems > 1 && (
                <span className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 bg-black/75 backdrop-blur-xs text-white text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-xs z-10">
                  {isVideoSelected ? "▶ Video" : `📷 ${selectedImageIndex + 1} / ${allImages.length}`}
                </span>
              )}
            </div>

            {/* Interactive Thumbnails Gallery Strip (up to 5 images + video) */}
            {totalGalleryItems > 1 && (
              <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar touch-scroll pb-1 pt-0.5">
                {allImages.map((img, idx) => {
                  const isActive = !isVideoSelected && selectedImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIsVideoSelected(false);
                        setSelectedImageIndex(idx);
                      }}
                      className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-2xl overflow-hidden border-2 transition cursor-pointer shrink-0 bg-white shadow-2xs ${
                        isActive
                          ? "border-blue-600 ring-2 ring-blue-500/30 scale-105"
                          : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 bg-blue-600 text-white text-[6px] sm:text-[7px] font-black px-1 rounded shadow-xs">
                          Main
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Video Thumbnail Button */}
                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setIsVideoSelected(true)}
                    className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-2xl overflow-hidden border-2 transition cursor-pointer shrink-0 bg-black flex flex-col items-center justify-center shadow-2xs ${
                      isVideoSelected
                        ? "border-purple-600 ring-2 ring-purple-500/30 scale-105"
                        : "border-gray-200 hover:border-purple-400 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <span className="text-base sm:text-xl text-white">▶</span>
                    <span className="text-[7px] sm:text-[9px] font-bold text-white uppercase tracking-wider mt-0.5">
                      Video
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Feature Perks */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 text-center pt-1 sm:pt-2">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-base sm:text-lg">🚚</span>
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-0.5 sm:mt-1 truncate">Free Shipping</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">Over Rs. 2,000</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-base sm:text-lg">🛡️</span>
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-0.5 sm:mt-1 truncate">100% Genuine</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">Verified Quality</p>
              </div>
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-base sm:text-lg">🔄</span>
                <p className="text-[10px] sm:text-[11px] font-bold text-gray-800 mt-0.5 sm:mt-1 truncate">Easy Return</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">30-day return</p>
              </div>
            </div>
          </div>

          {/* Right Column: Details, Pricing, & Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Category Tag */}
              <span className="inline-block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full mb-2 sm:mb-3">
                {product?.category || "General"}
              </span>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                {product?.title || "Product Title"}
              </h1>

              {/* Rating & Reviews Bar */}
              <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
                <div className="flex text-amber-400 text-sm sm:text-base">
                  {"★".repeat(avgRatingRounded)}
                  {"☆".repeat(5 - avgRatingRounded)}
                </div>
                <span className="text-xs font-bold text-gray-700">{avgRating}</span>
                <span className="text-gray-300">|</span>
                <a href="#reviews" className="text-xs text-blue-600 hover:underline font-medium">
                  {totalReviewsCount} {totalReviewsCount === 1 ? "Review" : "Reviews"}
                </a>
                <span className="text-gray-300">|</span>
                <span className="text-[11px] sm:text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  In Stock 🟢
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 flex items-baseline gap-3 sm:gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-semibold block uppercase">
                    {hasDiscount ? "Special Price" : "Price"}
                  </span>
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900">
                    Rs. {price.toLocaleString()}
                  </span>
                </div>

                {hasDiscount && (
                  <div>
                    <span className="text-[10px] sm:text-xs text-gray-400 font-medium block">Original Price</span>
                    <span className="text-sm sm:text-lg text-gray-400 line-through font-semibold">
                      Rs. {originalPrice.toLocaleString()}
                    </span>
                  </div>
                )}

                {hasDiscount && discountAmount > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-green-700 bg-green-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ml-auto">
                    Save Rs. {discountAmount.toLocaleString()} ({discountPercent}% OFF)
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-4 sm:mt-6">
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Product Description
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {product?.description || "No description provided."}
                </p>
              </div>

              {/* Key Features Bullets */}
              <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span> Premium high-durability material construction
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span> Ergonomic design tailored for everyday comfort
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">✓</span> 1-Year official brand warranty included
                </li>
              </ul>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
              {/* Quantity Counter */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
                <span className="text-xs sm:text-sm font-bold text-gray-800">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold text-gray-600 hover:bg-gray-200 transition cursor-pointer select-none"
                  >
                    -
                  </button>
                  <span className="w-9 sm:w-12 text-center text-xs sm:text-sm font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-base sm:text-lg font-bold text-gray-600 hover:bg-gray-200 transition cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-400">
                  Subtotal: <strong className="text-gray-900 text-xs sm:text-sm">Rs. {(price * quantity).toLocaleString()}</strong>
                </span>
              </div>

              {/* Add to Cart & Buy Now Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="touch-manipulation w-full py-2.5 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-xs sm:text-sm transition active:scale-95 shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>Add {quantity > 1 ? `${quantity} Items ` : ""}to Cart</span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="touch-manipulation w-full py-2.5 sm:py-3.5 px-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm transition active:scale-95 shadow-md shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>⚡</span> Buy Now
                </button>
              </div>


            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section id="reviews" className="mt-8 sm:mt-12 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs p-4 sm:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Customer Reviews</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Verified customers rating and experience</p>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <span className="text-2xl font-black text-amber-600">{avgRating}</span>
              <div>
                <div className="flex text-amber-500 text-xs">
                  {"★".repeat(avgRatingRounded)}
                  {"☆".repeat(5 - avgRatingRounded)}
                </div>
                <span className="text-[11px] text-gray-500 font-medium">
                  Based on {totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>
          </div>

          {/* Write a Review Form */}
          <form onSubmit={handleReviewSubmit} className="mt-6 p-4 sm:p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
              Write Your Review
            </h3>

            {reviewSubmitted && (
              <div className="mb-4 p-3 rounded-xl bg-green-100 text-green-800 text-xs font-semibold flex items-center gap-2">
                <span>✓</span> Review successfully saved! Thank you.
              </div>
            )}

            {reviewError && (
              <div className="mb-4 p-3 rounded-xl bg-red-100 text-red-800 text-xs font-semibold flex items-center gap-2">
                <span>✕</span> {reviewError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Asad Ali"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  required
                  disabled={isSubmittingReview}
                  className="w-full bg-white text-sm rounded-xl px-3.5 py-2 border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Rating</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  disabled={isSubmittingReview}
                  className="w-full bg-white text-sm rounded-xl px-3.5 py-2 border border-gray-200 focus:outline-hidden focus:border-blue-500 cursor-pointer"
                >
                  <option value={5}>★★★★★ (5 Stars - Excellent)</option>
                  <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                  <option value={2}>★★☆☆☆ (2 Stars - Below Average)</option>
                  <option value={1}>★☆☆☆☆ (1 Star - Poor)</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium text-gray-600 block mb-1">Your Experience / Review</label>
              <textarea
                rows={3}
                placeholder="Tell us about the product quality, fit, and delivery..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                disabled={isSubmittingReview}
                className="w-full bg-white text-sm rounded-xl p-3 border border-gray-200 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
            >
              {isSubmittingReview ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving to MongoDB...</span>
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>

          {/* Reviews List */}
          <div className="mt-8 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No reviews yet for this product. Be the first to write a review!
              </div>
            ) : (
              reviews.map((rev, idx) => (
                <div
                  key={rev._id || rev.id || idx}
                  className="p-5 rounded-2xl border border-gray-100 bg-white shadow-2xs hover:border-gray-200 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{rev.author}</span>
                      {rev.verified && (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {formatRelativeTime(rev.createdAt || rev.date)}
                    </span>
                  </div>

                  <div className="flex text-amber-400 text-xs mb-2">
                    {"★".repeat(Math.max(1, Math.min(5, Number(rev.rating) || 5)))}
                    {"☆".repeat(Math.max(0, 5 - Math.max(1, Math.min(5, Number(rev.rating) || 5))))}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-14">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-6">
              More Products in {product?.category || "Category"}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((rel) => (
                <Link
                  key={rel._id}
                  href={`/products/${rel._id}`}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1 cursor-pointer"
                >
                  <div className="aspect-square w-full bg-gray-100 overflow-hidden">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-xs sm:text-sm">
                        {rel.title}
                      </h4>
                      <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-1 mt-0.5 sm:mt-1">
                        {rel.description}
                      </p>
                    </div>
                    <div className="mt-2.5 sm:mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs sm:text-base font-extrabold text-gray-900">
                        Rs. {rel.price?.toLocaleString()}
                      </span>
                      <span className="text-[10px] sm:text-xs text-blue-600 font-semibold group-hover:underline">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Buy Now Checkout Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg sm:max-w-xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-7 shadow-2xl border border-gray-100">
            {orderConfirmed ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Order Confirmed!</h3>
                {placedBuyNowOrderNo && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-full">
                    Order #{placedBuyNowOrderNo}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  Your order has been placed successfully. It will be delivered within 2–3 working days.
                </p>
                <button
                  onClick={() => setShowBuyModal(false)}
                  className="mt-6 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">Customer Delivery Details</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500">Please provide complete information for order delivery.</p>
                  </div>
                  <button
                    onClick={() => setShowBuyModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl font-bold cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Summary */}
                <div className="py-2.5 sm:py-3 border-b border-gray-100 flex items-center gap-3 bg-gray-50/70 -mx-4 sm:-mx-7 px-4 sm:px-7 mb-4">
                  <img
                    src={product?.image || ""}
                    alt={product?.title || "Product"}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover bg-white border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">{product?.title}</h4>
                    <p className="text-[11px] sm:text-xs text-gray-500">Qty: {quantity} pc(s) × Rs. {price?.toLocaleString()}</p>
                    <span className="text-xs sm:text-sm font-black text-blue-600">Total: Rs. {(price * quantity).toLocaleString()} (COD)</span>
                  </div>
                </div>

                {/* Shipping form */}
                <form onSubmit={handleConfirmOrder} className="space-y-3.5">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Muhammad"
                        value={buyNowCustomer.firstName}
                        onChange={(e) =>
                          setBuyNowCustomer({ ...buyNowCustomer, firstName: e.target.value })
                        }
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Usman"
                        value={buyNowCustomer.lastName}
                        onChange={(e) =>
                          setBuyNowCustomer({ ...buyNowCustomer, lastName: e.target.value })
                        }
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Phone Number with Validation */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-gray-700 block">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400">11 digits (03XX-XXXXXXX)</span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0300-1234567"
                      value={buyNowCustomer.phone}
                      onChange={(e) => handleBuyNowPhoneChange(e.target.value)}
                      className={`w-full text-sm rounded-xl px-3.5 py-2.5 focus:outline-hidden transition ${buyNowPhoneError
                          ? "bg-red-50 border-2 border-red-500 text-red-900"
                          : "bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500"
                        }`}
                    />
                    {buyNowPhoneError && (
                      <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {buyNowPhoneError}
                      </p>
                    )}
                  </div>

                  {/* City Dropdown & District */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={buyNowCustomer.selectedCity}
                        onChange={(e) =>
                          setBuyNowCustomer({ ...buyNowCustomer, selectedCity: e.target.value })
                        }
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden cursor-pointer"
                      >
                        {PAKISTAN_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        District <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lahore / Rawalpindi"
                        value={buyNowCustomer.district}
                        onChange={(e) =>
                          setBuyNowCustomer({ ...buyNowCustomer, district: e.target.value })
                        }
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* If "Other" City is selected, show manual city field */}
                  {buyNowCustomer.selectedCity === "Other" && (
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl animate-fadeIn">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-black text-amber-900 block">
                          Enter your City name <span className="text-red-600">*</span>
                        </label>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          Must Field
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter your city name..."
                        value={buyNowCustomer.customCity}
                        onChange={(e) =>
                          setBuyNowCustomer({ ...buyNowCustomer, customCity: e.target.value })
                        }
                        className="w-full text-sm bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-hidden focus:border-blue-600 shadow-2xs font-semibold"
                      />
                      <p className="text-[11px] text-amber-800 font-medium mt-1.5 flex items-center gap-1">
                        <span>ℹ️</span> <strong>This field must be entered:</strong> Please enter your city name to ensure smooth delivery.
                      </p>
                    </div>
                  )}

                  {/* Detailed Address (House, Street / Sector) */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Sector / Street / House No <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. House # 14, Street # 3, Sector G-11/2"
                      value={buyNowCustomer.sectorStreet}
                      onChange={(e) =>
                        setBuyNowCustomer({ ...buyNowCustomer, sectorStreet: e.target.value })
                      }
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Payment Method Selector & Bank / Raast Details */}
                  <BankPaymentSection
                    payableAmount={price * quantity}
                    paymentMethod={buyNowPaymentMethod}
                    setPaymentMethod={setBuyNowPaymentMethod}
                    transactionId={buyNowTransactionId}
                    setTransactionId={setBuyNowTransactionId}
                    paymentReceipt={buyNowPaymentReceipt}
                    setPaymentReceipt={setBuyNowPaymentReceipt}
                    paymentBank={buyNowPaymentBank}
                    setPaymentBank={setBuyNowPaymentBank}
                  />

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isPlacingBuyNow}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isPlacingBuyNow ? (
                        <span>Processing Order...</span>
                      ) : buyNowPaymentMethod === "Bank Transfer / Raast QR" ? (
                        <>
                          <span>Submit Order with Payment Proof (Rs. {(price * quantity).toLocaleString()})</span>
                          <span>✓</span>
                        </>
                      ) : (
                        <>
                          <span>Confirm Order (Rs. {(price * quantity).toLocaleString()}) - Cash on Delivery</span>
                          <span>→</span>
                        </>
                      )}
                    </button>
                    <div className="flex items-center justify-center gap-4 mt-2.5 text-[11px] text-gray-400">
                      <span>🔒 100% Safe Checkout</span>
                      <span>•</span>
                      <span>{buyNowPaymentMethod === "Bank Transfer / Raast QR" ? "Instant Bank Verification" : "Cash on Delivery Available"}</span>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
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
