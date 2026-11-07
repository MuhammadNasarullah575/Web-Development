import connectDB from "@/app/lib/db";
import Product from "@/app/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    // First clear existing data to prevent duplicates
    await Product.deleteMany({});

    // Sample products to insert into the database
    const sampleProducts = [
      {
        title: "Blue Sneakers",
        description: "Comfortable and stylish running sneakers for daily use.",
        price: 61,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Wireless Noise-Canceling Headphones",
        description: "High-fidelity audio with active noise cancellation and 30-hour battery life.",
        price: 120,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Minimalist Leather Watch",
        description: "Classic analog wrist watch with genuine brown leather strap.",
        price: 85,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Everyday Casual Sneakers",
        description: "Versatile sneakers with cushioned soles for everyday comfort.",
        price: 55,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Classic White Sneakers",
        description: "Clean and lightweight sneakers that pair easily with casual outfits.",
        price: 68,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Performance Running Shoes",
        description: "Breathable running shoes with responsive cushioning and reliable grip.",
        price: 95,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Urban Street Sneakers",
        description: "Modern streetwear sneakers with durable construction and a comfortable fit.",
        price: 78,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Lightweight Walking Shoes",
        description: "Flexible walking shoes designed for long days on your feet.",
        price: 49,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Portable Bluetooth Speaker",
        description: "Compact wireless speaker with rich sound and a rechargeable battery.",
        price: 45,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "True Wireless Earbuds",
        description: "Pocket-sized earbuds with touch controls and a convenient charging case.",
        price: 65,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Studio Over-Ear Headphones",
        description: "Comfortable over-ear headphones with detailed audio for music and editing.",
        price: 99,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Mechanical Keyboard",
        description: "Responsive mechanical keyboard with durable keys for work and gaming.",
        price: 89,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Wireless Computer Mouse",
        description: "Ergonomic wireless mouse with precise tracking and adjustable sensitivity.",
        price: 29,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Desktop Monitor",
        description: "Sharp widescreen display for productive work and immersive entertainment.",
        price: 229,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Digital Photography Camera",
        description: "Versatile digital camera for capturing detailed photos and everyday moments.",
        price: 549,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Fitness Smartwatch",
        description: "Track daily activity, workouts, and notifications from your wrist.",
        price: 149,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Slim Everyday Laptop",
        description: "Portable laptop with a sleek design for studying, browsing, and office work.",
        price: 799,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Portable Tablet",
        description: "Lightweight touchscreen tablet for reading, streaming, and everyday tasks.",
        price: 329,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Modern Smartphone",
        description: "Sleek smartphone with a vivid display and a versatile camera system.",
        price: 599,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Wireless Game Controller",
        description: "Comfortable game controller with responsive buttons and precise analog sticks.",
        price: 59,
        category: "Electronics",
        image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Luxury Analog Watch",
        description: "Elegant analog watch with a polished finish for formal and casual occasions.",
        price: 175,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Classic Leather Wallet",
        description: "Compact leather wallet with multiple card slots and a cash compartment.",
        price: 35,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Everyday Sunglasses",
        description: "Lightweight sunglasses with a timeless frame for sunny days.",
        price: 39,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Everyday Backpack",
        description: "Practical backpack with organized compartments for daily essentials.",
        price: 59,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Elegant Handbag",
        description: "Stylish handbag with a spacious interior and comfortable carrying handles.",
        price: 89,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Travel Backpack",
        description: "Roomy travel backpack with adjustable straps and convenient storage pockets.",
        price: 79,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Vintage Leather Strap Watch",
        description: "Refined wristwatch with a classic dial and a comfortable leather strap.",
        price: 110,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Basic Cotton T-Shirt",
        description: "Soft and breathable cotton T-shirt for relaxed everyday wear.",
        price: 19,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Classic Denim Jacket",
        description: "Timeless denim jacket with a comfortable fit and practical front pockets.",
        price: 69,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Everyday Pullover Hoodie",
        description: "Cozy pullover hoodie with a drawstring hood and a roomy front pocket.",
        price: 45,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Classic Denim Jeans",
        description: "Durable denim jeans with a versatile fit for casual styling.",
        price: 55,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Relaxed Fit T-Shirt",
        description: "Easygoing T-shirt with a relaxed silhouette and soft fabric.",
        price: 24,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Warm Knit Sweater",
        description: "Comfortable knitted sweater that adds warmth to your everyday wardrobe.",
        price: 49,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Casual Button-Down Shirt",
        description: "Versatile button-down shirt for relaxed office days and weekend outings.",
        price: 39,
        category: "Clothing",
        image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Ceramic Coffee Mug",
        description: "Comfortable ceramic mug for your morning coffee, tea, or hot chocolate.",
        price: 15,
        category: "Home & Living",
        image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Modern Table Lamp",
        description: "Compact table lamp that provides warm lighting for your desk or bedside.",
        price: 42,
        category: "Home & Living",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Comfortable Living Room Sofa",
        description: "Spacious upholstered sofa with soft cushions for everyday relaxation.",
        price: 499,
        category: "Furniture",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Ergonomic Office Chair",
        description: "Supportive office chair designed for comfortable work and study sessions.",
        price: 189,
        category: "Furniture",
        image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Decorative Indoor Plant",
        description: "A fresh touch of greenery for your living room, workspace, or bedroom.",
        price: 25,
        category: "Home & Living",
        image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Minimalist Wall Clock",
        description: "Simple wall clock with an easy-to-read face and a clean modern design.",
        price: 32,
        category: "Home & Living",
        image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Soft Decorative Cushion",
        description: "Comfortable accent cushion that adds texture to sofas and reading corners.",
        price: 22,
        category: "Home & Living",
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Cotton Bedding Set",
        description: "Soft cotton bedding that creates a comfortable and inviting bedroom.",
        price: 79,
        category: "Home & Living",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Reusable Water Bottle",
        description: "Portable reusable bottle for staying hydrated at work, the gym, or outdoors.",
        price: 24,
        category: "Kitchen",
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Home Coffee Maker",
        description: "Convenient coffee maker for preparing fresh coffee in your own kitchen.",
        price: 129,
        category: "Kitchen",
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Ceramic Dinnerware Set",
        description: "Coordinated ceramic dinnerware for everyday meals and special gatherings.",
        price: 64,
        category: "Kitchen",
        image: "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Modern Accent Chair",
        description: "Stylish accent chair that brings comfortable extra seating to any room.",
        price: 139,
        category: "Furniture",
        image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Exercise Yoga Mat",
        description: "Cushioned exercise mat for yoga, stretching, and floor workouts.",
        price: 29,
        category: "Sports & Fitness",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Dumbbell Training Set",
        description: "Durable dumbbells for strength training and home fitness routines.",
        price: 89,
        category: "Sports & Fitness",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Outdoor Basketball",
        description: "Durable basketball with a textured surface for confident handling.",
        price: 28,
        category: "Sports & Fitness",
        image: "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Training Soccer Ball",
        description: "Reliable soccer ball for practice sessions and friendly matches.",
        price: 25,
        category: "Sports & Fitness",
        image: "https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Tennis Racket",
        description: "Comfortable tennis racket with balanced handling for practice and recreation.",
        price: 75,
        category: "Sports & Fitness",
        image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Daily Skincare Set",
        description: "Everyday skincare essentials for a simple cleansing and moisturizing routine.",
        price: 49,
        category: "Beauty",
        image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Signature Perfume",
        description: "A balanced fragrance with fresh opening notes and a warm finish.",
        price: 79,
        category: "Beauty",
        image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Hardcover Notebook",
        description: "Durable notebook for journaling, meeting notes, and everyday planning.",
        price: 14,
        category: "Stationery",
        image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop&q=80",
      },
      {
        title: "Premium Writing Pen",
        description: "Smooth-writing pen with a comfortable grip for daily notes and signatures.",
        price: 18,
        category: "Stationery",
        image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
      },
    ];

    const productsInPkr = sampleProducts.map((p) => ({
      ...p,
      price: Math.round(p.price * 280),
    }));

    const insertedProducts = await Product.insertMany(productsInPkr);

    return NextResponse.json({
      success: true,
      message: `Database seeded successfully! ${insertedProducts.length} products inserted.`,
      count: insertedProducts.length,
      products: insertedProducts,
    });
  } catch (error) {
    console.error("Seed API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to seed database.",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
