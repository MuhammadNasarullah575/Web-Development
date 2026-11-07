"use client";

import { useState } from "react";

const STATUS_STEPS = [
  { key: "Pending", label: "Order Placed", step: 1 },
  { key: "Processing", label: "Processing & Packed", step: 2 },
  { key: "Order Dispatch", label: "Dispatched with Courier", step: 3 },
  { key: "Delivered", label: "Delivered", step: 4 },
];

function getStepNumber(status) {
  switch (status) {
    case "Pending":
      return 1;
    case "Processing":
      return 2;
    case "Order Dispatch":
      return 3;
    case "Delivered":
      return 4;
    case "Return":
    case "Cancel":
      return -1;
    default:
      return 1;
  }
}

export default function TrackOrderModal({ isOpen, onClose }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleTrack = async (e) => {
    e.preventDefault();
    setError("");
    setOrderData(null);

    if (!orderNumber.trim() || !phone.trim()) {
      setError("Please enter both Order ID and Mobile Number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrderData(data.order);
      } else {
        setError(data.message || "No order found matching these details.");
      }
    } catch (err) {
      console.error("Track order error:", err);
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTrackingId = (id) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setOrderData(null);
    setError("");
    setOrderNumber("");
    setPhone("");
  };

  const currentStep = orderData ? getStepNumber(orderData.status) : 0;
  const isCancelled = orderData && (orderData.status === "Cancel" || orderData.status === "Return");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-8 shadow-2xl border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-2xs">
              📦
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900 tracking-tight">Track Your Order</h3>
              <p className="text-xs text-gray-500">Live order status & courier consignment tracking</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-manipulation text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer transition active:scale-95"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Search Form (shown when no order data or tracking another order) */}
        {!orderData ? (
          <div className="mt-6">
            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Order ID / Order Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ORD-124522 or 124522"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Find your Order ID in your checkout confirmation screen
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Registered Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 0300-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  The 11-digit mobile number provided at checkout
                </span>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying & Tracking...</span>
                  </>
                ) : (
                  <>
                    <span>Track Order Status</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Order Details & Tracking Results */
          <div className="mt-6 space-y-6 animate-fadeIn">
            {/* Top Bar with Order Number & Current Status */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs text-gray-400 font-bold block uppercase tracking-wider">
                  Order Number
                </span>
                <span className="text-lg font-black text-gray-900 font-mono">
                  #{orderData.orderNumber}
                </span>
                <span className="text-xs text-gray-500 block mt-0.5">
                  Placed on {new Date(orderData.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              <div>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-block shadow-2xs ${orderData.status === "Delivered"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : orderData.status === "Order Dispatch"
                      ? "bg-purple-100 text-purple-800 border border-purple-300"
                      : orderData.status === "Processing"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : isCancelled
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-amber-100 text-amber-800 border border-amber-300"
                    }`}
                >
                  ● {orderData.status}
                </span>
              </div>
            </div>

            {/* Visual Timeline (when not cancelled) */}
            {!isCancelled ? (
              <div className="py-2">
                <div className="flex items-center justify-between relative">
                  {/* Connecting Line */}
                  <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-6 h-0.5 bg-gray-200 -z-0"></div>
                  <div
                    className="absolute top-4 left-4 sm:left-6 h-0.5 bg-blue-600 transition-all duration-500 -z-0"
                    style={{
                      width:
                        currentStep === 1
                          ? "0%"
                          : currentStep === 2
                            ? "33%"
                            : currentStep === 3
                              ? "66%"
                              : currentStep === 4
                                ? "100%"
                                : "0%",
                    }}
                  ></div>

                  {STATUS_STEPS.map((step) => {
                    const isPassed = currentStep >= step.step;
                    const isCurrent = currentStep === step.step;

                    return (
                      <div key={step.step} className="flex flex-col items-center text-center z-10 flex-1 min-w-0 max-w-[76px] sm:max-w-[96px]">
                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-bold transition-all shadow-xs ${isPassed
                            ? "bg-blue-600 text-white ring-2 sm:ring-4 ring-blue-100"
                            : "bg-white text-gray-400 border-2 border-gray-200"
                            }`}
                        >
                          {isPassed ? "✓" : step.step}
                        </div>
                        <span
                          className={`text-[9px] sm:text-[11px] mt-1.5 sm:mt-2 font-bold leading-tight ${isCurrent
                            ? "text-blue-600"
                            : isPassed
                              ? "text-gray-800"
                              : "text-gray-400"
                            }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
                This order has been marked as <strong>{orderData.status}</strong>.
              </div>
            )}

            {/* Courier & Tracking Integration Section */}
            {orderData.courier && orderData.trackingId ? (
              <div className="p-3.5 sm:p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/80 rounded-2xl shadow-xs">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-10 sm:w-24 sm:h-12 rounded-xl bg-white border border-gray-200/90 flex items-center justify-center p-1.5 shadow-2xs overflow-hidden shrink-0">
                      {orderData.courierDetails?.logo ? (
                        <img
                          src={orderData.courierDetails.logo}
                          alt={orderData.courier}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xl">🚚</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-gray-900">
                        {orderData.courier}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-500">
                        Official Delivery Partner
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-600 text-white text-[9px] sm:text-[10px] font-black uppercase rounded-full">
                    In Transit
                  </span>
                </div>

                {/* Tracking ID & Copy Button */}
                <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Consignment / Tracking Number
                    </span>
                    <span className="text-sm font-mono font-black text-gray-900">
                      {orderData.trackingId}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyTrackingId(orderData.trackingId)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                    title="Copy Tracking ID"
                  >
                    {copied ? "Copied! ✓" : "Copy"}
                  </button>
                </div>

                {/* Live External Tracking Button */}
                {orderData.trackingUrl && (
                  <div className="mt-3.5">
                    <a
                      href={orderData.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Track Live on {orderData.courier} Portal</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
                    </a>
                    <span className="text-[10px] text-gray-400 text-center block mt-1.5">
                      Opens official real-time tracking system in a new tab
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">
                    Awaiting Courier Dispatch
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your order is currently being prepared. Once handed over to the courier (e.g. PostEx, TCS, Leopard, Trax, or Pakistan Post), tracking details will be visible here.
                  </p>
                </div>
              </div>
            )}

            {/* Customer & Delivery Address */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl text-xs space-y-1 shadow-2xs">
              <span className="font-extrabold text-gray-900 block uppercase tracking-wider text-[10px]">
                Delivery Destination
              </span>
              <p className="font-bold text-gray-900">{orderData.customer?.name}</p>
              <p className="text-gray-600">
                {orderData.customer?.sectorStreet ? `${orderData.customer.sectorStreet}, ` : ""}
                {orderData.customer?.district ? `District ${orderData.customer.district}, ` : ""}
                {orderData.customer?.city}
              </p>
            </div>

            {/* Ordered Items Summary */}
            <div className="border border-gray-200 rounded-2xl p-4 bg-white shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                  Ordered Items ({orderData.items?.length || 0})
                </h5>
                <span className="text-xs font-black text-blue-600">
                  Total: Rs. {orderData.totalAmount?.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto divide-y divide-gray-100">
                {orderData.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 pt-2 first:pt-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Qty: {item.quantity} × Rs. {item.price?.toLocaleString()}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action to track another */}
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
            >
              ← Track Another Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

