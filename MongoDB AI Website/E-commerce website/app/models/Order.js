import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: false,
  },
  title: {
    type: String,
    required: [true, "Item title is required"],
  },
  price: {
    type: Number,
    required: [true, "Item price is required"],
  },
  quantity: {
    type: Number,
    required: [true, "Item quantity is required"],
    default: 1,
    min: 1,
  },
  image: {
    type: String,
    default: "",
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customer: {
      firstName: {
        type: String,
        trim: true,
        default: "",
      },
      lastName: {
        type: String,
        trim: true,
        default: "",
      },
      name: {
        type: String,
        required: [true, "Customer name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
      },
      city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
      },
      district: {
        type: String,
        trim: true,
        default: "",
      },
      sectorStreet: {
        type: String,
        trim: true,
        default: "",
      },
      address: {
        type: String,
        required: [true, "Delivery address is required"],
        trim: true,
      },
      notes: {
        type: String,
        default: "",
      },
    },
    items: {
      type: [orderItemSchema],
      required: [true, "Order must contain at least one item"],
      validate: [(val) => val.length > 0, "Order items cannot be empty"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },
    paymentMethod: {
      type: String,
      default: "Cash on Delivery",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Pending Verification", "Paid"],
      default: "Unpaid",
    },
    transactionId: {
      type: String,
      trim: true,
      default: "",
    },
    paymentReceipt: {
      type: String,
      default: "",
    },
    paymentBank: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Order Dispatch", "Delivered", "Return", "Cancel"],
      default: "Pending",
    },
    courier: {
      type: String,
      enum: ["Pakistan Post", "PostEx", "Trax", "TCS", "Leopard", ""],
      default: "",
    },
    trackingId: {
      type: String,
      trim: true,
      default: "",
    },
    dispatchedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.model("Order", orderSchema);

