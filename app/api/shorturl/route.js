// app/api/shorturl/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Url from "@/models/Url";
import { nanoid } from "nanoid";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("Request body:", body);

    const { url, userId, expiresAt } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const shortId = nanoid(6);

    const newUrl = await Url.create({
      originalUrl: url,
      shortUrl: shortId,
      userId: userId || null,
      expiresAt: expiresAt ? new Date(expiresAt) : null, // Convert to Date if provided
    });

    return NextResponse.json({
      shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${shortId}`,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}