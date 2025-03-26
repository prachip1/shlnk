// app/api/links/[id]/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Url from "@/models/Url";
import { auth } from "@clerk/nextjs/server";

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const urlDoc = await Url.findOne({ _id: id, userId });

    if (!urlDoc) {
      return NextResponse.json({ error: "URL not found or not authorized" }, { status: 404 });
    }

    await Url.deleteOne({ _id: id });
    return NextResponse.json({ message: "URL deleted" });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}