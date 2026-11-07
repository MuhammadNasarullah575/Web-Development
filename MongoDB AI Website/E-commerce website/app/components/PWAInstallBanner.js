"use client";

import { useState, useEffect } from "react";

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("Service Worker registered:", reg.scope))
        .catch((err) => console.log("SW register error:", err));
    }

    // 2. Detect standalone (already installed)
    const checkStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(checkStandalone);

    // 3. Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Capture PWA beforeinstallprompt (Chrome Android & Desktop PC)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      alert(
        "To install on PC:\nClick the Install icon in the browser address bar (top right) or Menu (⋮) -> 'Install StoreZen'.\n\nOn Mobile:\nTap Menu (⋮) -> 'Add to Home Screen'."
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  // If already running inside installed standalone app, or dismissed, don't show
  if (isStandalone || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom Install Badge for Desktop & Mobile */}
      <div className="fixed bottom-20 left-4 z-40 animate-bounce">
        <button
          type="button"
          onClick={handleInstallClick}
          className="touch-manipulation px-3.5 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/30 flex items-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
          title="Install StoreZen as App on your PC or Mobile"
        >
          <span className="text-sm">📲</span>
          <span>Install StoreZen App</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="ml-1 text-white/70 hover:text-white text-xs p-0.5"
            title="Dismiss"
          >
            ✕
          </span>
        </button>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div
          className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner">
              🍏
            </div>
            <h4 className="text-base font-extrabold text-gray-900">
              Install StoreZen on iPhone
            </h4>
            <div className="text-xs text-gray-600 space-y-2 text-left bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              <p className="flex items-center gap-2">
                <span className="font-bold text-blue-600">1.</span> Tap the <strong>Share</strong> button (⎋) at bottom of Safari.
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-blue-600">2.</span> Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-blue-600">3.</span> Tap <strong>"Add"</strong> at top right.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition"
            >
              Got It!
            </button>
          </div>
        </div>
      )}
    </>
  );
}

