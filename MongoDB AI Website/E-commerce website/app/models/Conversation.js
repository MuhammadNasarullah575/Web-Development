import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    customerPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    relatedOrderNumber: {
      type: String,
      default: "",
      trim: true,
    },
    lastMessage: {
      text: { type: String, default: "" },
      sender: { type: String, enum: ["customer", "admin", "system"], default: "system" },
      createdAt: { type: Date, default: Date.now },
    },
    unreadByCustomer: {
      type: Number,
      default: 0,
      min: 0,
    },
    unreadByAdmin: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound indexes for scaling to thousands of concurrent chats
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ customerPhone: 1, updatedAt: -1 });

export default mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);

