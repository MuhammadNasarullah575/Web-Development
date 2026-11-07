import connectDB from "@/app/lib/db";
import Conversation from "@/app/models/Conversation";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const customerPhone = searchParams.get("customerPhone")?.trim() || "";

    const query = {};

    if (customerPhone) {
      query.customerPhone = customerPhone;
    } else if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { customerPhone: { $regex: search, $options: "i" } },
        { relatedOrderNumber: { $regex: search, $options: "i" } },
      ];
    }

    const conversations = await Conversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("GET /api/chat/conversations error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { customerPhone, customerName, relatedOrderNumber = "" } = body;

    if (!customerPhone) {
      return NextResponse.json(
        { success: false, message: "Customer phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = customerPhone.trim();
    const cleanName = customerName?.trim() || "Customer";

    let conversation = await Conversation.findOne({ customerPhone: cleanPhone });

    if (!conversation) {
      conversation = await Conversation.create({
        customerPhone: cleanPhone,
        customerName: cleanName,
        relatedOrderNumber,
        unreadByCustomer: 0,
        unreadByAdmin: 0,
        lastMessage: {
          text: "Welcome to StoreZen Support! How can we help you today?",
          sender: "system",
          createdAt: new Date(),
        },
      });
    } else if (cleanName && conversation.customerName !== cleanName) {
      conversation.customerName = cleanName;
      if (relatedOrderNumber) conversation.relatedOrderNumber = relatedOrderNumber;
      await conversation.save();
    }

    return NextResponse.json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("POST /api/chat/conversations error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

