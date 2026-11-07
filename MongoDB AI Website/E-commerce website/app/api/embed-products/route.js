import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { openai, isValidOpenAIKey } from "@/app/lib/openai";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    if (!isValidOpenAIKey()) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A valid OPENAI_API_KEY was not found. Please paste your personal OpenAI API key into the `.env.local` file.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    const filter = force
      ? {}
      : { $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] };

    const products = await Product.find(filter);

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Embeddings for all products already exist!",
        updatedCount: 0,
      });
    }

    const inputs = products.map((p) =>
      `${p.title} | Category: ${p.category} | Description: ${p.description}`.replace(/\n+/g, " ")
    );

    const batchSize = 50;
    let totalUpdated = 0;

    for (let i = 0; i < products.length; i += batchSize) {
      const currentBatchProducts = products.slice(i, i + batchSize);
      const currentBatchInputs = inputs.slice(i, i + batchSize);

      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: currentBatchInputs,
      });

      const updatePromises = currentBatchProducts.map((product, idx) => {
        product.embedding = response.data[idx].embedding;
        return product.save();
      });

      await Promise.all(updatePromises);
      totalUpdated += currentBatchProducts.length;
    }

    return NextResponse.json({
      success: true,
      message: `${totalUpdated} Embedding saved successfully`,
      updatedCount: totalUpdated,
    });
  } catch (error) {
    console.error("Embed route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Embeddings generation failed",
      },
      { status: 500 }
    );
  }
}
