import connectDB from "@/app/lib/db";
import Order from "@/app/models/Order";
import { getTrackingUrl, getCourierConfig } from "@/app/lib/courierConfig";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { orderNumber, phone } = body;

    if (!orderNumber || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Both Order ID and Mobile Number are required to track your order.",
        },
        { status: 400 }
      );
    }

    const trimmedOrder = orderNumber.toString().trim().replace(/^#/, "");
    const cleanPhoneDigits = phone.toString().replace(/\D/g, "");

    if (cleanPhoneDigits.length < 7) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid mobile phone number.",
        },
        { status: 400 }
      );
    }

    // Match orderNumber flexibly: ORD-123456 or 123456
    const orderNumberCandidates = [
      trimmedOrder,
      trimmedOrder.toUpperCase(),
      `ORD-${trimmedOrder}`,
      `ORD-${trimmedOrder.toUpperCase()}`,
      trimmedOrder.replace(/^ORD-?/i, ""),
    ];

    // Digits of phone: last 10 digits (e.g. 3001234567)
    const phoneSuffix = cleanPhoneDigits.slice(-10);

    const orders = await Order.find({
      orderNumber: { $in: orderNumberCandidates },
    }).lean();

    // Verify phone number match
    const matchedOrder = orders.find((o) => {
      const storedPhoneDigits = (o.customer?.phone || "").toString().replace(/\D/g, "");
      return storedPhoneDigits.endsWith(phoneSuffix) || phoneSuffix.endsWith(storedPhoneDigits);
    });

    if (!matchedOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "No matching order found. Please check your Order ID and Mobile Number.",
        },
        { status: 404 }
      );
    }

    const courierConfig = getCourierConfig(matchedOrder.courier);
    const trackingUrl = getTrackingUrl(matchedOrder.courier, matchedOrder.trackingId);

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: matchedOrder.orderNumber,
        status: matchedOrder.status,
        createdAt: matchedOrder.createdAt,
        updatedAt: matchedOrder.updatedAt,
        dispatchedAt: matchedOrder.dispatchedAt || null,
        totalAmount: matchedOrder.totalAmount,
        paymentMethod: matchedOrder.paymentMethod || "Cash on Delivery",
        courier: matchedOrder.courier || "",
        trackingId: matchedOrder.trackingId || "",
        courierDetails: courierConfig,
        trackingUrl: trackingUrl,
        customer: {
          name: matchedOrder.customer?.name || "",
          city: matchedOrder.customer?.city || "",
          district: matchedOrder.customer?.district || "",
          sectorStreet: matchedOrder.customer?.sectorStreet || "",
        },
        items: (matchedOrder.items || []).map((it) => ({
          title: it.title,
          price: it.price,
          quantity: it.quantity,
          image: it.image || "",
        })),
      },
    });
  } catch (error) {
    console.error("Track Order API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to track order due to a server error.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

