import connectDB from "@/app/lib/db";
import Conversation from "@/app/models/Conversation";
import Message from "@/app/models/Message";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    const reader = searchParams.get("reader"); // "admin" | "customer"

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: "conversationId is required" },
        { status: 400 }
      );
    }

    // Reset unread counters atomically based on reader
    if (reader === "admin") {
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: { unreadByAdmin: 0 },
      });
      await Message.updateMany(
        { conversationId, sender: "customer", isRead: false },
        { $set: { isRead: true } }
      );
    } else if (reader === "customer") {
      await Conversation.findByIdAndUpdate(conversationId, {
        $set: { unreadByCustomer: 0 },
      });
      await Message.updateMany(
        { conversationId, sender: { $ne: "customer" }, isRead: false },
        { $set: { isRead: true } }
      );
    }

    // Fetch messages sorted chronologically, excluding messages deleted for this reader
    const query = { conversationId };
    if (reader) {
      query.deletedFor = { $ne: reader };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("GET /api/chat/messages error:", error);
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
    const {
      conversationId,
      sender,
      text,
      type = "text",
      orderDetails = null,
    } = body;

    if (!conversationId || !sender || !text?.trim()) {
      return NextResponse.json(
        { success: false, message: "Missing required fields (conversationId, sender, text)" },
        { status: 400 }
      );
    }

    const cleanText = text.trim();

    // 1. Create message
    const message = await Message.create({
      conversationId,
      sender,
      text: cleanText,
      type,
      orderDetails,
      isRead: false,
    });

    // 2. Atomically update conversation last message and unread count
    const incField = sender === "customer" ? { unreadByAdmin: 1 } : { unreadByCustomer: 1 };
    await Conversation.findByIdAndUpdate(conversationId, {
      $set: {
        lastMessage: {
          text: cleanText,
          sender,
          createdAt: new Date(),
        },
      },
      $inc: incField,
    });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("POST /api/chat/messages error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { messageId, deleteMode = "everyone", requester = "customer" } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, message: "messageId is required" },
        { status: 400 }
      );
    }

    const targetMsg = await Message.findById(messageId);
    if (!targetMsg) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 }
      );
    }

    if (deleteMode === "everyone") {
      await Message.findByIdAndUpdate(messageId, {
        $set: {
          isDeletedForEveryone: true,
          deletedBy: requester,
          deletedAt: new Date(),
          text: "This message was deleted",
        },
      });

      // Check if conversation last message needs update
      const conv = await Conversation.findById(targetMsg.conversationId);
      if (conv) {
        conv.lastMessage = {
          text: "🚫 This message was deleted",
          sender: targetMsg.sender,
          createdAt: new Date(),
        };
        await conv.save();
      }
    } else {
      // deleteMode === "forMe"
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: requester },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Message deleted successfully",
      messageId,
      deleteMode,
    });
  } catch (error) {
    console.error("DELETE /api/chat/messages error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

