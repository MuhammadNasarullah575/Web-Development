import connectDB from "@/app/lib/db";
import Order from "@/app/models/Order";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { sendAutomatedPaymentNotification } from "@/app/lib/chatHelper";

const VALID_STATUSES = [
  "Pending",
  "Processing",
  "Order Dispatch",
  "Delivered",
  "Return",
  "Cancel",
];

export async function PATCH(request, context) {
  try {
    await connectDB();

    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Order ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, courier, trackingId, paymentStatus, rejectionReason } = body;

    const updateFields = {};

    if (paymentStatus !== undefined) {
      const VALID_PAYMENT_STATUSES = ["Unpaid", "Pending Verification", "Paid"];
      if (VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
        updateFields.paymentStatus = paymentStatus;
      }
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateFields.status = status;
      if (status === "Order Dispatch") {
        updateFields.dispatchedAt = new Date();
      }
    }

    if (courier !== undefined) {
      updateFields.courier = courier.trim();
    }

    if (trackingId !== undefined) {
      updateFields.trackingId = trackingId.trim();
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // Automated Chat Notifications for Payment Verification / Issue
    if (paymentStatus === "Paid") {
      try {
        await sendAutomatedPaymentNotification({ order: updatedOrder, isApproved: true });
      } catch (chatErr) {
        console.error("Auto chat notification error:", chatErr);
      }
    } else if (paymentStatus === "Unpaid" && rejectionReason) {
      try {
        await sendAutomatedPaymentNotification({
          order: updatedOrder,
          isApproved: false,
          reason: rejectionReason,
        });
      } catch (chatErr) {
        console.error("Auto chat notification error:", chatErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return NextResponse.json(
      { success: false, message: "Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  try {
    await connectDB();

    const resolvedParams = await Promise.resolve(context?.params);
    const id = resolvedParams?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid Order ID" },
        { status: 400 }
      );
    }

    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order #${deletedOrder.orderNumber} deleted`,
    });
  } catch (error) {
    console.error("Order delete error:", error);
    return NextResponse.json(
      { success: false, message: "Error", error: error.message },
      { status: 500 }
    );
  }
}

