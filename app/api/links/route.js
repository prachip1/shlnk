// app/api/links/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Url from "@/models/Url";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const links = await Url.find({ userId });
    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}