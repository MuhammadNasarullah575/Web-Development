"use client";

import { useState, useEffect } from "react";

export default function BankPaymentSection({
  payableAmount,
  paymentMethod,
  setPaymentMethod,
  transactionId,
  setTransactionId,
  paymentReceipt,
  setPaymentReceipt,
  paymentBank,
  setPaymentBank,
}) {
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [copiedField, setCopiedField] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  useEffect(() => {
    fetch("/api/payment-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
          if (data.settings.bankName && !paymentBank) {
            setPaymentBank(data.settings.bankName);
          }
        }
      })
      .catch((err) => console.error("Error fetching payment settings:", err))
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload a valid image screenshot (JPG, PNG).");
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setPaymentReceipt(data.url);
      } else {
        setUploadError(data.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Receipt upload error:", err);
      setUploadError("Network error. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Determine QR Code: use uploaded qrCodeUrl if available, otherwise dynamic Raast QR (500x500 high-res)
  const qrDisplayUrl =
    settings?.qrCodeUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
      `RAASTPAY:${settings?.raastId || "03233937672"}?amount=${payableAmount || 0}`
    )}`;

  return (
    <div className="space-y-3 pt-2">
      <label className="text-xs font-bold text-gray-800 block uppercase tracking-wider">
        Select Payment Method <span className="text-red-500">*</span>
      </label>

      {/* 2 Payment Options: COD vs Bank Transfer / Raast QR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Option 1: Cash on Delivery */}
        <div
          onClick={() => setPaymentMethod("Cash on Delivery")}
          className={`p-3 rounded-xl border-2 transition cursor-pointer select-none flex items-center gap-3 ${
            paymentMethod === "Cash on Delivery"
              ? "border-blue-600 bg-blue-50/50 shadow-xs"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "Cash on Delivery"}
            onChange={() => setPaymentMethod("Cash on Delivery")}
            className="w-4 h-4 text-blue-600 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-900">
              <span>💵</span>
              <span>Cash on Delivery</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 truncate">
              Pay in cash when parcel arrives
            </p>
          </div>
        </div>

        {/* Option 2: Bank Transfer / Raast QR */}
        <div
          onClick={() => setPaymentMethod("Bank Transfer / Raast QR")}
          className={`p-3 rounded-xl border-2 transition cursor-pointer select-none flex items-center gap-3 ${
            paymentMethod === "Bank Transfer / Raast QR"
              ? "border-blue-600 bg-blue-50/50 shadow-xs"
              : "border-gray-200 hover:border-gray-300 bg-white"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === "Bank Transfer / Raast QR"}
            onChange={() => setPaymentMethod("Bank Transfer / Raast QR")}
            className="w-4 h-4 text-blue-600 cursor-pointer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-900">
              <span>🏦</span>
              <span>Bank Transfer / Raast QR</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 truncate">
              Instant scan & pay (SadaPay, Meezan, etc.)
            </p>
          </div>
        </div>
      </div>

      {/* Expanded Bank Details & QR Code section when Bank Transfer is selected */}
      {paymentMethod === "Bank Transfer / Raast QR" && (
        <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 via-white to-gray-50 border border-blue-200/80 shadow-2xs space-y-3.5 animate-fadeIn">
          {/* Header Banner */}
          <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-600 text-white text-xs font-black">
                🏦
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-gray-900">
                  {settings?.bankName || "Meezan Bank"} / Raast
                </h4>
                <p className="text-[10px] text-gray-500">Official Store Account</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Total to Pay
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-600">
                Rs. {payableAmount?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Bank Credentials Cards with 1-Click Copy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Account Title */}
            <div className="bg-white p-2.5 rounded-xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                  Account Title
                </span>
                <span className="font-extrabold text-gray-900 truncate block text-xs">
                  {settings?.accountTitle || "StoreZen E-Commerce"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(settings?.accountTitle || "StoreZen E-Commerce", "title")}
                className="px-2 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0"
              >
                {copiedField === "title" ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Raast ID */}
            <div className="bg-white p-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/30 shadow-2xs flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block flex items-center gap-1">
                  <span>⚡</span> Raast ID
                </span>
                <span className="font-black text-emerald-900 font-mono tracking-wider truncate block text-xs">
                  {settings?.raastId || "03233937672"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(settings?.raastId || "03233937672", "raast")}
                className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0"
              >
                {copiedField === "raast" ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* Account Number */}
            <div className="bg-white p-2.5 rounded-xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                  Account Number
                </span>
                <span className="font-bold text-gray-900 font-mono truncate block text-xs">
                  {settings?.accountNumber || "01020304050607"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(settings?.accountNumber || "01020304050607", "acc")}
                className="px-2 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0"
              >
                {copiedField === "acc" ? "✓ Copied" : "Copy"}
              </button>
            </div>

            {/* IBAN */}
            <div className="bg-white p-2.5 rounded-xl border border-gray-200/90 shadow-2xs flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase block">
                  IBAN Number
                </span>
                <span className="font-bold text-gray-900 font-mono truncate block text-[11px]">
                  {settings?.iban || "PK00MEZN0001020304050607"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(settings?.iban || "PK00MEZN0001020304050607", "iban")}
                className="px-2 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg text-[10px] font-bold transition cursor-pointer shrink-0"
              >
                {copiedField === "iban" ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Large & High-Visibility QR Code Scan Area */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-blue-200/90 shadow-xs text-center space-y-3.5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black">
                <span>📱</span>
                <span>Scan & Pay with Any Mobile App</span>
              </div>
              <p className="text-xs text-gray-600 font-medium max-w-sm mx-auto">
                Scan QR using <strong>SadaPay, NayaPay, Raast, Meezan, HBL, EasyPaisa, JazzCash</strong>, or any banking app.
              </p>
            </div>

            {/* Prominent Large QR Code Frame with Scanner Guides */}
            <div className="relative inline-block mx-auto">
              <div
                onClick={() => setIsZoomOpen(true)}
                title="Click to enlarge QR code"
                className="group relative cursor-pointer p-3 sm:p-4 bg-gradient-to-b from-gray-50 via-white to-gray-50 rounded-2xl border-2 border-blue-400 hover:border-blue-600 shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              >
                {/* Viewfinder scanner corners */}
                <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-blue-600 rounded-tl-md pointer-events-none"></div>
                <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-blue-600 rounded-tr-md pointer-events-none"></div>
                <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-blue-600 rounded-bl-md pointer-events-none"></div>
                <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-blue-600 rounded-br-md pointer-events-none"></div>

                {/* Big QR Display Container (Scalable & Clear) */}
                <div className="w-60 h-60 sm:w-72 sm:h-72 max-w-[82vw] flex items-center justify-center bg-white rounded-xl overflow-hidden p-2">
                  <img
                    src={qrDisplayUrl}
                    alt="Bank / Raast QR Code"
                    className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-103"
                  />
                </div>

                {/* Hover/Tap Zoom Badge */}
                <div className="absolute inset-0 bg-blue-900/15 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center pointer-events-none">
                  <span className="bg-gray-900/85 backdrop-blur-xs text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
                    <span>🔍</span> Click to Enlarge / Full Screen
                  </span>
                </div>
              </div>

              {/* Action Buttons Below Frame */}
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full transition cursor-pointer shadow-2xs"
                >
                  <span>🔍</span>
                  <span>Tap to Enlarge QR</span>
                </button>
                <a
                  href={qrDisplayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition"
                  title="Open original QR image in new tab"
                >
                  <span>↗</span>
                  <span>Open Full Image</span>
                </a>
              </div>
            </div>

            {/* Badges / Guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-gray-100 text-[11px]">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60">
                ⚡ Raast Instant
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-800 font-bold border border-blue-200/60">
                🛡️ 0% Extra Charges
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 font-semibold border border-gray-200">
                🇵🇰 All Pakistani Banks
              </span>
            </div>
          </div>

          {/* Payment Proof Inputs: TID & Receipt Screenshot */}
          <div className="bg-blue-50/60 p-3 rounded-2xl border border-blue-200/70 space-y-2.5">
            <h5 className="text-xs font-black text-blue-950 flex items-center gap-1.5">
              <span>🧾</span> Submit Payment Proof
            </h5>

            {/* Transaction ID Input */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                Transaction ID (TID) / Reference Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required={paymentMethod === "Bank Transfer / Raast QR"}
                placeholder="e.g. 5839201948, TID-7492, or SadaPay ref"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full text-xs sm:text-sm bg-white border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono tracking-wider font-semibold shadow-2xs"
              />
            </div>

            {/* Payment Receipt / Screenshot Upload */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-gray-700 block">
                  Payment Screenshot / Receipt <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-gray-400">JPG, PNG (Max 10MB)</span>
              </div>

              {paymentReceipt ? (
                <div className="relative w-full p-2 bg-white rounded-xl border border-emerald-300 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={paymentReceipt}
                      alt="Receipt Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-emerald-700 block truncate flex items-center gap-1">
                        <span>✓</span> Receipt Uploaded!
                      </span>
                      <span className="text-[10px] text-gray-400 block truncate">
                        Attached with your order
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaymentReceipt("")}
                    className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                  >
                    Change ✕
                  </button>
                </div>
              ) : (
                <label className="relative border-2 border-dashed border-blue-300 hover:border-blue-500 bg-white p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition text-center hover:bg-blue-50/40">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {isUploading ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading receipt screenshot...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700">
                      <span>📸</span>
                      <span>Upload Payment Screenshot / Slip</span>
                    </div>
                  )}
                </label>
              )}

              {uploadError && (
                <p className="text-[11px] font-bold text-red-600 mt-1">⚠️ {uploadError}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen QR Lightbox / Zoom Modal for Effortless Scanning */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200 text-center space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="text-left">
                <h4 className="text-base font-extrabold text-gray-900 flex items-center gap-1.5">
                  <span>📱</span> Scan QR Code to Pay
                </h4>
                <p className="text-xs text-gray-500">Hold your mobile camera or banking app to the screen</p>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Extra Large Frame in Lightbox */}
            <div className="p-3 bg-white rounded-2xl border-2 border-blue-500 shadow-inner flex items-center justify-center">
              <img
                src={qrDisplayUrl}
                alt="Enlarged QR Code"
                className="max-h-[55vh] max-w-full w-auto object-contain rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <div className="text-xs text-gray-700 font-semibold">
                Total to Pay: <span className="text-emerald-600 font-black text-base">Rs. {payableAmount?.toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-gray-500">
                Works with <strong>SadaPay, NayaPay, Raast, EasyPaisa, JazzCash, Meezan, HBL</strong>, and all banking apps.
              </p>
              <button
                type="button"
                onClick={() => setIsZoomOpen(false)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer active:scale-98"
              >
                Done Scanning ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

