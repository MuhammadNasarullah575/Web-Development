import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ["customer", "admin", "system"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "payment_approved", "payment_rejected", "order_status"],
      default: "text",
    },
    orderDetails: {
      orderNumber: { type: String, default: "" },
      totalAmount: { type: Number, default: 0 },
      items: [
        {
          title: { type: String, default: "" },
          price: { type: Number, default: 0 },
          quantity: { type: Number, default: 1 },
        },
      ],
      reason: { type: String, default: "" },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeletedForEveryone: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: String,
      default: "",
    },
    deletedFor: {
      type: [String],
      default: [],
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// High-performance compound indexes for rapid cursor pagination & querying
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ conversationId: 1, isRead: 1 });

if (process.env.NODE_ENV !== "production" && mongoose.models.Message) {
  delete mongoose.models.Message;
}

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);

