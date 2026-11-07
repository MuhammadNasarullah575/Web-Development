import connectDB from "@/app/lib/db";
import Conversation from "@/app/models/Conversation";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const customerPhone = searchParams.get("customerPhone")?.trim();
    const forAdmin = searchParams.get("forAdmin") === "true";

    if (customerPhone) {
      const conv = await Conversation.findOne({ customerPhone }).select("unreadByCustomer").lean();
      return NextResponse.json({
        success: true,
        unreadCount: conv?.unreadByCustomer || 0,
      });
    }

    if (forAdmin) {
      const result = await Conversation.aggregate([
        { $group: { _id: null, totalUnread: { $sum: "$unreadByAdmin" } } },
      ]);
      const totalUnread = result[0]?.totalUnread || 0;
      return NextResponse.json({
        success: true,
        unreadCount: totalUnread,
      });
    }

    return NextResponse.json({ success: true, unreadCount: 0 });
  } catch (error) {
    console.error("GET /api/chat/unread error:", error);
    return NextResponse.json({ success: false, unreadCount: 0 });
  }
}

