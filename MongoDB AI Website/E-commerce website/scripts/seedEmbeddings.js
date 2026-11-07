const mongoose = require("mongoose");
const { generateSemanticVector } = require("../app/lib/vectorGenerator");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://nasarullahlak_db_user:yfNIc1jc1CPsADyA@cluster0.h3y1f3w.mongodb.net/ecommerce?retryWrites=true&w=majority";

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully!");

  const db = mongoose.connection.db;
  const collection = db.collection("products");

  const products = await collection.find({}).toArray();
  console.log(`Found ${products.length} products to generate embeddings for.`);

  let updatedCount = 0;
  for (const product of products) {
    const textToEmbed = `${product.title} ${product.category} ${product.description}`;
    const embedding = generateSemanticVector(textToEmbed, 1536);

    await collection.updateOne(
      { _id: product._id },
      {
        $set: {
          embedding: embedding,
        },
      }
    );
    updatedCount++;
    if (updatedCount % 10 === 0 || updatedCount === products.length) {
      console.log(`Updated embeddings for ${updatedCount}/${products.length} products...`);
    }
  }

  console.log(`Done! Successfully updated ${updatedCount} products with 1536-dim vector embeddings in MongoDB Atlas.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});

