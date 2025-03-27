// app/api/shorturl/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Url from "@/models/Url";
import User from "@/models/User"; // Import the User model
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

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check user's remaining links
    const user = await User.findOne({ userId });
    if (!user || !user.remainingLinks || user.remainingLinks <= 0) {
      return NextResponse.json(
        { error: "You’ve used all your links. Please purchase a new plan." },
        { status: 400 }
      );
    }

    // Generate short URL
    const shortId = nanoid(6);
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${shortId}`;

    // Store the short URL in the Url collection
    const newUrl = await Url.create({
      originalUrl: url,
      shortUrl: shortId,
      userId: userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    // Decrement remaining links and add the short URL to the user's links array
    await User.updateOne(
      { userId },
      {
        $inc: { remainingLinks: -1 },
        $push: { links: shortUrl },
      }
    );

    return NextResponse.json({ shortUrl });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}