// app/api/get-user-plan/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findOne({ userId });
    return NextResponse.json(user || {});
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json({ error: "Failed to fetch user plan" }, { status: 500 });
  }
}