import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  author: {
    type: String,
    required: [true, "Author name is required"],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
    default: 5,
  },
  comment: {
    type: String,
    required: [true, "Comment is required"],
    trim: true,
  },
  verified: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a product title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
    },
    originalPrice: {
      type: Number,
      default: [],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
    },
    image: {
      type: String,
      required: [true, "Please provide an image URL"],
    },
    images: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      default: "",
    },
    embedding: {
      type: [Number],
      default: [],
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.model("Product", productSchema);
