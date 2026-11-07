export const COURIER_OPTIONS = [
  {
    id: "Pakistan Post",
    name: "Pakistan Post",
    logo: "/couriers/pakistan-post.svg",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeBg: "bg-emerald-600 text-white",
    trackUrl: (id) => `https://ep.gov.pk/`,
    description: "Pakistan Post Express Parcel Tracking",
  },
  {
    id: "PostEx",
    name: "PostEx",
    logo: "/couriers/postex.svg",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    badgeBg: "bg-orange-600 text-white",
    trackUrl: (id) => `https://postex.pk/tracking?cn=${encodeURIComponent(id)}`,
    description: "PostEx Merchant & Logistics Real-time Tracking",
  },
  {
    id: "Trax",
    name: "Trax",
    logo: "/couriers/trax.svg",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badgeBg: "bg-blue-600 text-white",
    trackUrl: (id) => `https://sonic.pk/tracking?tracking_number=${encodeURIComponent(id)}`,
    description: "Trax Sonic Logistics Real-time Tracking",
  },
  {
    id: "TCS",
    name: "TCS",
    logo: "/couriers/tcs.svg",
    color: "bg-red-50 text-red-700 border-red-200",
    badgeBg: "bg-red-600 text-white",
    trackUrl: (id) => `https://www.tcsexpress.com/tracking?tracking_number=${encodeURIComponent(id)}`,
    description: "TCS Express & Courier Services",
  },
  {
    id: "Leopard",
    name: "Leopard",
    logo: "/couriers/leopard.svg",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    badgeBg: "bg-amber-600 text-white",
    trackUrl: (id) => `https://www.leopardscourier.com/tracking?track_numbers=${encodeURIComponent(id)}`,
    description: "Leopards Courier Live Consignment Tracking",
  },
];

export function getCourierConfig(courierName) {
  if (!courierName) return null;
  return (
    COURIER_OPTIONS.find(
      (c) => c.id.toLowerCase() === courierName.trim().toLowerCase()
    ) || null
  );
}

export function getTrackingUrl(courierName, trackingId) {
  const conf = getCourierConfig(courierName);
  if (!conf || !trackingId) return null;
  return conf.trackUrl(trackingId);
}

