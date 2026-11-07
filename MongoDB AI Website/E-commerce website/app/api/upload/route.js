import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 }
      );
    }

    const mimeType = file.type || "";
    const isImage = mimeType.startsWith("image/");
    const isVideo = mimeType.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, message: "Only image and video files are supported." },
        { status: 400 }
      );
    }

    // Maximum file limit: 60MB for short videos & images
    const MAX_SIZE = 60 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, message: "File exceeds 60MB limit. Please upload a smaller short video or image." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || (isImage ? ".jpg" : ".mp4");
    const cleanBase = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const uniqueFilename = `${Date.now()}_${cleanBase}${ext}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      message: `${isImage ? "Image" : "Video"} uploaded successfully!`,
      url: publicUrl,
      type: isImage ? "image" : "video",
      filename: uniqueFilename,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, message: "File upload failed.", error: error.message },
      { status: 500 }
    );
  }
}

