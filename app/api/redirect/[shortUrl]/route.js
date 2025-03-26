// app/api/redirect/[shortUrl]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Url from "@/models/Url";

export async function GET(request, { params }) {
  await connectDB();

  const { shortUrl } =await params;

  try {
    const urlDoc = await Url.findOne({ shortUrl });

    if (!urlDoc) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    // Check if the link has expired
    if (urlDoc.expiresAt && new Date(urlDoc.expiresAt) < new Date()) {
      return NextResponse.json({ error: "URL has expired" }, { status: 410 });
    }

    const referrer = request.headers.get("referer") || "unknown";
    const ipAddress = request.headers.get("x-forwarded-for") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    urlDoc.clicks += 1;
    urlDoc.clickDetails.push({
      timestamp: new Date(),
      referrer,
      ipAddress,
      userAgent,
    });

    await urlDoc.save();

    return NextResponse.redirect(urlDoc.originalUrl);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}