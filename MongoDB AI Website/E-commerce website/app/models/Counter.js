import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 749200,
  },
});

if (mongoose.models.Counter) {
  delete mongoose.models.Counter;
}

export default mongoose.model("Counter", counterSchema);

