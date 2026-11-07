import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    // Default admin secret passcode is "admin123" (or customizable via ADMIN_PASSWORD in .env.local)
    const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (!password || password.trim() !== expectedPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect Password! Access Denied.",
        },
        { status: 401 }
      );
    }

    // Generate a simple session token
    const token = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      token,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Authentication error", error: error.message },
      { status: 500 }
    );
  }
}

