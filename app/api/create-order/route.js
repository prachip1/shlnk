// app/api/create-order/route.js
import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    const { amount, plan } = await req.json(); // Amount in paise and plan (e.g., "20_links")

    // Validate the request
    if (!amount || !plan) {
      return NextResponse.json({ error: "Amount and plan are required" }, { status: 400 });
    }

    // Create a Razorpay order
    const order = await razorpay.orders.create({
      amount: amount, // Amount in paise (e.g., 50000 for ₹500)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { plan }, // Store the plan in notes for later use
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}