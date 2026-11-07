"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

export default function WhatsAppButton() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);

  // Only display on customer pages (never inside admin gateway)
  if (pathname?.startsWith("/sz-master-gateway")) {
    return null;
  }

  const phoneNumber = "923233937672";
  const defaultMessage = encodeURIComponent(
    "Hello StoreZen! I am interested in your products and have a query."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <aside
      aria-label="WhatsApp Customer Support"
      className="fixed bottom-3.5 right-3.5 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 group select-none"
    >
     

      {/* Floating Button with Expanding Wave Effect */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-green-600/30 transition-all duration-300 hover:scale-110 cursor-pointer relative"
        title="Chat on WhatsApp: 0323-3937672"
      >
        {/* Continuous Dynamic Ripple Wave 1 (Ping) */}
        <span className="absolute -inset-1.5 rounded-full bg-[#25D366] opacity-75 animate-ping pointer-events-none"></span>

       

        {/* WhatsApp Official SVG Icon */}
        <svg
          className="w-5.5 h-5.5 sm:w-7 sm:h-7 fill-current relative z-10"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.507 14.307l-.009.075c-.236 1.2-1.398 2.05-2.607 2.05-.623 0-1.222-.224-1.785-.544-2.502-1.424-4.148-3.766-4.996-4.97-.478-.68-.823-1.442-.823-2.26 0-1.298.815-2.453 2.062-2.617.227-.03.457-.018.679.034.407.096.643.518.789.897.266.69.605 1.637.66 1.77.106.257.078.53-.082.748-.12.164-.265.342-.395.49-.15.172-.15.358-.046.541.488.859 1.258 1.696 2.094 2.222.185.116.368.106.526-.054.142-.143.32-.36.48-.523.18-.184.425-.236.67-.145.245.091 1.57.771 1.84.908.27.137.409.206.47.31.061.103.061.597-.175 1.148zM12 2C6.477 2 2 6.477 2 12c0 1.892.524 3.662 1.433 5.176L2 22l4.982-1.395A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.632 0-3.15-.506-4.417-1.37l-.316-.215-3.275.918.918-3.197-.215-.328A8.17 8.17 0 013.8 12c0-4.521 3.679-8.2 8.2-8.2s8.2 3.679 8.2 8.2-3.679 8.2-8.2 8.2z" />
        </svg>
      </a>
    </aside>
  );
}

