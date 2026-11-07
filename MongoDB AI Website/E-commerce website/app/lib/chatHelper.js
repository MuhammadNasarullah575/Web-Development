import connectDB from "@/app/lib/db";
import Conversation from "@/app/models/Conversation";
import Message from "@/app/models/Message";

/**
 * Sends an automated system/admin notification message to a customer regarding their order payment status.
 * Safe for high concurrency and atomic database updates.
 */
export async function sendAutomatedPaymentNotification({
  order,
  isApproved,
  reason = "",
}) {
  if (!order || !order.customer?.phone) {
    console.warn("sendAutomatedPaymentNotification: Missing order or customer phone");
    return null;
  }

  await connectDB();

  const customerPhone = order.customer.phone.trim();
  const customerName = order.customer.name?.trim() || "Valued Customer";
  const orderNumber = order.orderNumber || order._id?.toString().slice(-6);
  const totalAmount = order.totalAmount || 0;
  const items = Array.isArray(order.items) ? order.items : [];

  // 1. Find or create conversation for this customer
  let conversation = await Conversation.findOne({ customerPhone });
  if (!conversation) {
    conversation = await Conversation.create({
      customerPhone,
      customerName,
      relatedOrderNumber: orderNumber,
      unreadByCustomer: 0,
      unreadByAdmin: 0,
    });
  } else {
    // Update related order and customer name if changed
    conversation.customerName = customerName;
    conversation.relatedOrderNumber = orderNumber;
  }

  // 2. Build structured message text
  let messageText = "";
  let messageType = "text";

  if (isApproved) {
    messageType = "payment_approved";
    const itemsList = items
      .map(
        (it) =>
          `• ${it.title} (Qty: ${it.quantity || 1}) - Rs. ${(
            Number(it.price || 0) * Number(it.quantity || 1)
          ).toLocaleString()}`
      )
      .join("\n");

    messageText = `🎉 Payment Verified & Confirmed!\n\nDear ${customerName},\nWe have successfully verified and received your payment of Rs. ${totalAmount.toLocaleString()} for Order #${orderNumber}.\n\n📦 Order Details:\n${itemsList || "• Store Items"}\n\n💰 Total Paid: Rs. ${totalAmount.toLocaleString()}\n💳 Method: ${order.paymentMethod || "Bank Transfer / Raast"}\n\nYour order is now being processed for packing and shipment. We will send you courier tracking details once dispatched!\n\nThank you for shopping with StoreZen!`;
  } else {
    messageType = "payment_rejected";
    const issueReason =
      reason.trim() ||
      "The Transaction ID (TID) could not be matched with our bank records, or the receipt screenshot was unreadable.";

    messageText = `⚠️ Payment Verification Notice\n\nDear ${customerName},\nWe could not approve your payment verification for Order #${orderNumber} (Rs. ${totalAmount.toLocaleString()}).\n\nReason:\n"${issueReason}"\n\nPlease review your bank transaction and reply in this chat with the correct Transaction ID (TID) or an updated receipt screenshot so our team can approve your order promptly.`;
  }

  // 3. Create Message record
  const createdMessage = await Message.create({
    conversationId: conversation._id,
    sender: "system",
    text: messageText,
    type: messageType,
    orderDetails: {
      orderNumber,
      totalAmount,
      items: items.map((it) => ({
        title: it.title,
        price: it.price,
        quantity: it.quantity,
      })),
      reason: isApproved ? "" : reason,
    },
    isRead: false,
  });

  // 4. Update Conversation state atomically
  conversation.lastMessage = {
    text: isApproved
      ? `🎉 Payment Approved for Order #${orderNumber}`
      : `⚠️ Payment Issue on Order #${orderNumber}`,
    sender: "system",
    createdAt: new Date(),
  };
  conversation.unreadByCustomer = (conversation.unreadByCustomer || 0) + 1;
  await conversation.save();

  return { conversation, message: createdMessage };
}

