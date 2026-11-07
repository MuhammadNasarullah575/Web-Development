import connectDB from "@/app/lib/db";
import Counter from "@/app/models/Counter";

const STARTING_ORDER_NUMBER = 749201;

/**
 * Generates an atomic, collision-free sequential order number.
 * Starts from ORD-749201 and increments strictly by +1 for each order.
 */
export async function getNextOrderNumber() {
  await connectDB();

  // Atomically increment the sequence counter
  const counter = await Counter.findByIdAndUpdate(
    "orderNumber",
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  let currentSeq = counter?.seq;

  // Ensure sequence starts at least at STARTING_ORDER_NUMBER
  if (!currentSeq || currentSeq < STARTING_ORDER_NUMBER) {
    const initialized = await Counter.findByIdAndUpdate(
      "orderNumber",
      { $set: { seq: STARTING_ORDER_NUMBER } },
      { new: true, upsert: true }
    );
    currentSeq = initialized.seq;
  }

  return `ORD-${currentSeq}`;
}

