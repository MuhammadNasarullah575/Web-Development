import connectDB from "@/app/lib/db";
import Order from "@/app/models/Order";
import { validatePakistaniPhone } from "@/app/lib/pakistanLocations";
import { getNextOrderNumber } from "@/app/lib/orderNumberGenerator";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const query = {};
    if (status && status !== "All") {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Orders GET API Error:", error);
    return NextResponse.json(
      { success: false, message: "Error while fetching order", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      customer,
      items,
      totalAmount,
      paymentMethod = "Cash on Delivery",
      transactionId = "",
      paymentReceipt = "",
      paymentBank = "",
    } = body;

    const firstName = customer?.firstName?.trim() || "";
    const lastName = customer?.lastName?.trim() || "";
    const fullName = customer?.name?.trim() || `${firstName} ${lastName}`.trim();
    const phone = customer?.phone?.trim() || "";
    const city = customer?.city?.trim() || "";
    const district = customer?.district?.trim() || "";
    const sectorStreet = customer?.sectorStreet?.trim() || "";

    if (!fullName || !phone || !city) {
      return NextResponse.json(
        { success: false, message: "Name, Mobile Number and City must be entered" },
        { status: 400 }
      );
    }

    // Server-side mobile number format validation
    const phoneCheck = validatePakistaniPhone(phone);
    if (!phoneCheck.isValid) {
      return NextResponse.json(
        { success: false, message: phoneCheck.message },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "An order must contain at least one item." },
        { status: 400 }
      );
    }

    // Build complete human-readable delivery address
    const fullAddress =
      customer?.address?.trim() ||
      `${sectorStreet ? sectorStreet + ", " : ""}${district ? district + ", " : ""}${city}`.trim();

    // Atomically generate collision-free sequential order number starting from ORD-749201
    const orderNumber = await getNextOrderNumber();

    const newOrder = await Order.create({
      orderNumber,
      customer: {
        firstName,
        lastName,
        name: fullName,
        phone: phoneCheck.formatted || phone,
        city,
        district,
        sectorStreet,
        address: fullAddress,
        notes: customer?.notes || "",
      },
      items: items.map((item) => ({
        productId: item._id || item.productId || null,
        title: item.title,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        image: item.image || "",
      })),
      totalAmount: Number(totalAmount) || 0,
      paymentMethod,
      paymentStatus:
        paymentMethod === "Bank Transfer / Raast QR" ? "Pending Verification" : "Unpaid",
      transactionId: transactionId ? String(transactionId).trim() : "",
      paymentReceipt: paymentReceipt || "",
      paymentBank: paymentBank || "",
      status: "Pending",
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Order POST API Error:", error);
    return NextResponse.json(
      { success: false, message: "Error!", error: error.message },
      { status: 500 }
    );
  }
}
