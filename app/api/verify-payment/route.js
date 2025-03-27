// app/api/verify-payment/route.js
import Razorpay from "razorpay";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await connectDB();

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, userId, plan } = await req.json();

    // Verify the payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return new Response(JSON.stringify({ error: "Payment verification failed" }), { status: 400 });
    }

    // Payment is verified, store the plan in MongoDB
    await User.updateOne(
      { userId },
      {
        $set: {
          purchasedPlan: plan,
          remainingLinks: plan.links,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: "Server error during payment verification" }), { status: 500 });
  }
}