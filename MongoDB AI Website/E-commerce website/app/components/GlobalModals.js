"use client";

import { useCart } from "../context/CartContext";
import CartDrawer from "./CartDrawer";
import TrackOrderModal from "./TrackOrderModal";
import WhatsAppButton from "./WhatsAppButton";
import CustomerChatDrawer from "./CustomerChatDrawer";
import PWAInstallBanner from "./PWAInstallBanner";

export default function GlobalModals() {
  const { isTrackOrderOpen, setIsTrackOrderOpen } = useCart();

  return (
    <>
      <CartDrawer />
      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />
      <CustomerChatDrawer />
      <WhatsAppButton />
      <PWAInstallBanner />
    </>
  );
}

