"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import { PAKISTAN_CITIES, validatePakistaniPhone } from "../lib/pakistanLocations";
import BankPaymentSection from "./BankPaymentSection";

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPieces,
    totalPrice,
    setCustomerChatPhone,
    setCustomerChatName,
  } = useCart();

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placedOrderNumber, setPlacedOrderNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Payment Options States
  const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");
  const [transactionId, setTransactionId] = useState("");
  const [paymentReceipt, setPaymentReceipt] = useState("");
  const [paymentBank, setPaymentBank] = useState("Meezan Bank");

  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    selectedCity: "Lahore",
    customCity: "",
    Tehsil: "",
    sectorStreet: "",
  });

  if (!isCartOpen) return null;

  const handlePhoneChange = (val) => {
    setShippingInfo({ ...shippingInfo, phone: val });
    if (phoneError) {
      const check = validatePakistaniPhone(val);
      if (check.isValid) setPhoneError("");
    }
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();

    // 1. Phone validation
    const phoneCheck = validatePakistaniPhone(shippingInfo.phone);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.message);
      return;
    }
    setPhoneError("");

    // 2. City validation
    const effectiveCity =
      shippingInfo.selectedCity === "Other"
        ? shippingInfo.customCity.trim()
        : shippingInfo.selectedCity;

    if (!effectiveCity) {
      alert("Please enter your city name");
      return;
    }

    if (
      !shippingInfo.firstName.trim() ||
      !shippingInfo.lastName.trim() ||
      !shippingInfo.Tehsil.trim() ||
      !shippingInfo.sectorStreet.trim()
    ) {
      alert("Fill all required fields");
      return;
    }

    // 3. Bank Transfer validation
    if (paymentMethod === "Bank Transfer / Raast QR") {
      if (!transactionId.trim()) {
        alert("Please enter the Transaction ID (TID) from your bank/app receipt.");
        return;
      }
      if (!paymentReceipt.trim()) {
        alert("Please upload the payment screenshot / receipt slip.");
        return;
      }
    }

    const fullAddress = `${shippingInfo.sectorStreet.trim()}, Tehsil ${shippingInfo.Tehsil.trim()}, ${effectiveCity}`;

    setIsSubmittingOrder(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName: shippingInfo.firstName.trim(),
            lastName: shippingInfo.lastName.trim(),
            name: `${shippingInfo.firstName.trim()} ${shippingInfo.lastName.trim()}`,
            phone: phoneCheck.formatted || shippingInfo.phone.trim(),
            city: effectiveCity,
            Tehsil: shippingInfo.Tehsil.trim(),
            sectorStreet: shippingInfo.sectorStreet.trim(),
            address: fullAddress,
          },
          items: cart.map((item) => ({
            _id: item._id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          totalAmount: totalPrice,
          paymentMethod,
          transactionId: paymentMethod === "Bank Transfer / Raast QR" ? transactionId.trim() : "",
          paymentReceipt: paymentMethod === "Bank Transfer / Raast QR" ? paymentReceipt : "",
          paymentBank: paymentMethod === "Bank Transfer / Raast QR" ? paymentBank : "",
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        const orderPhone = phoneCheck.formatted || shippingInfo.phone.trim();
        const orderName = `${shippingInfo.firstName.trim()} ${shippingInfo.lastName.trim()}`.trim();
        try {
          localStorage.setItem("storezen_customer_phone", orderPhone);
          localStorage.setItem("storezen_customer_name", orderName);
          if (setCustomerChatPhone) setCustomerChatPhone(orderPhone);
          if (setCustomerChatName) setCustomerChatName(orderName);
        } catch (e) {}

        setPlacedOrderNumber(data.order.orderNumber);
        setOrderConfirmed(true);
        setTimeout(() => {
          clearCart();
          setShowCheckoutModal(false);
          setOrderConfirmed(false);
          setIsCartOpen(false);
          setPlacedOrderNumber("");
          setTransactionId("");
          setPaymentReceipt("");
          setPaymentMethod("Cash on Delivery");
          setShippingInfo({
            firstName: "",
            lastName: "",
            phone: "",
            selectedCity: "Lahore",
            customCity: "",
            Tehsil: "",
            sectorStreet: "",
          });
        }, 3600);
      } else {
        alert(data.message || "Error!");
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Order does't placed, please try again");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <span>🛒</span> Your Shopping Cart
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {totalItems} unique {totalItems === 1 ? "item" : "items"} ({totalPieces} total {totalPieces === 1 ? "piece" : "pieces"})
              </p>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3 sm:space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl mb-4 text-gray-400">
                  🛒
                </div>
                <h3 className="text-lg font-bold text-gray-800">Your cart is empty</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Your cart is currently empty. Start shopping!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Start Shopping →
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="p-2.5 sm:p-3.5 bg-gray-50/80 rounded-xl sm:rounded-2xl border border-gray-100 flex gap-2.5 sm:gap-3.5 items-center relative group hover:border-gray-200 transition"
                >
                  {/* Product Thumbnail */}
                  <Link
                    href={`/products/${item._id}`}
                    onClick={() => setIsCartOpen(false)}
                    className="w-14 h-14 sm:w-18 sm:h-18 rounded-lg sm:rounded-xl bg-white overflow-hidden shrink-0 border border-gray-200 cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item._id}`}
                      onClick={() => setIsCartOpen(false)}
                      className="font-bold text-xs sm:text-sm text-gray-900 hover:text-blue-600 transition truncate block"
                    >
                      {item.title}
                    </Link>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase font-semibold block mt-0.5 truncate">
                      {item.category} • Rs. {item.price?.toLocaleString()}
                    </span>

                    {/* Quantity Controls & Item Total */}
                    <div className="flex items-center justify-between mt-2 gap-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item._id, -1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 cursor-pointer transition select-none"
                          title="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="w-6 sm:w-8 text-center text-xs font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, 1)}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 cursor-pointer transition select-none"
                          title="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-extrabold text-xs sm:text-sm text-gray-900 shrink-0">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Delete Item Button */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer self-start"
                    title="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer with Summary & Buttons */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-white space-y-4">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Unique Items:</span>
                  <span className="font-bold text-gray-900">{totalItems}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pieces:</span>
                  <span className="font-bold text-gray-900">{totalPieces} pcs</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="font-bold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Amount:</span>
                  <span className="text-blue-600">Rs. {totalPrice?.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons: Clear Cart & Buy / Checkout */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={clearCart}
                  className="py-3 px-4 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>

                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>⚡</span> Buy Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal for Full Cart */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg sm:max-w-xl w-full p-4 sm:p-7 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto">
            {orderConfirmed ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Order Placed!</h3>
                {placedOrderNumber && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-full">
                    Order #{placedOrderNumber}
                  </span>
                )}
                <p className="text-sm text-gray-500 mt-2">
                 Your order for all items has been confirmed! Order will be delivered within 2–3 days.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-extrabold text-gray-900">Checkout Cart</h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">Delivery & Contact Information</p>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="py-2.5 sm:py-3 border-b border-gray-100 text-xs text-gray-600 flex justify-between items-center bg-gray-50/70 -mx-4 sm:-mx-7 px-4 sm:px-7 mb-4">
                  <span>Total: <strong>{totalItems} items ({totalPieces} pieces)</strong></span>
                  <span className="font-extrabold text-sm sm:text-base text-blue-600">Rs. {totalPrice?.toLocaleString()}</span>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
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
                        value={shippingInfo.firstName}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, firstName: e.target.value })
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
                        value={shippingInfo.lastName}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, lastName: e.target.value })
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
                      value={shippingInfo.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className={`w-full text-sm rounded-xl px-3.5 py-2.5 focus:outline-hidden transition ${
                        phoneError
                          ? "bg-red-50 border-2 border-red-500 text-red-900"
                          : "bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:border-blue-500"
                      }`}
                    />
                    {phoneError && (
                      <p className="text-[11px] font-bold text-red-600 mt-1 flex items-center gap-1">
                        <span>⚠️</span> {phoneError}
                      </p>
                    )}
                  </div>

                  {/* City Dropdown & Tehsil */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={shippingInfo.selectedCity}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, selectedCity: e.target.value })
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
                        Tehsil <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lahore / Rawalpindi"
                        value={shippingInfo.Tehsil}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, Tehsil: e.target.value })
                        }
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* If "Other" City is selected, show manual city field */}
                  {shippingInfo.selectedCity === "Other" && (
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
                        value={shippingInfo.customCity}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, customCity: e.target.value })
                        }
                        className="w-full text-sm bg-white border border-amber-300 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-hidden focus:border-blue-600 shadow-2xs font-semibold"
                      />
                      <p className="text-[11px] text-amber-800 font-medium mt-1.5 flex items-center gap-1">
                        <span>ℹ️</span> <strong>This field must be entered</strong> Please enter your city name to ensure smooth delivery.
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
                      value={shippingInfo.sectorStreet}
                      onChange={(e) =>
                        setShippingInfo({ ...shippingInfo, sectorStreet: e.target.value })
                      }
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Payment Method Selector & Bank / Raast Details */}
                  <BankPaymentSection
                    payableAmount={totalPrice}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    transactionId={transactionId}
                    setTransactionId={setTransactionId}
                    paymentReceipt={paymentReceipt}
                    setPaymentReceipt={setPaymentReceipt}
                    paymentBank={paymentBank}
                    setPaymentBank={setPaymentBank}
                  />

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      {isSubmittingOrder
                        ? "Placing Order in Database..."
                        : paymentMethod === "Bank Transfer / Raast QR"
                        ? `Submit Order with Payment Proof (Rs. ${totalPrice?.toLocaleString()})`
                        : `Confirm Order (Rs. ${totalPrice?.toLocaleString()}) - Cash on Delivery`}
                    </button>
                    <p className="text-center text-[11px] text-gray-400 mt-2">
                      🔒 100% Safe Checkout • {paymentMethod === "Bank Transfer / Raast QR" ? "Instant Bank Verification" : "Cash on Delivery Available"}
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

