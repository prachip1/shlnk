// app/payment/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaCheck, FaStar, FaBolt } from "react-icons/fa";

const PaymentPage = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState({}); // Separate loading state for each plan
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // Track if Razorpay script is loaded

  const plans = [
    {
      label: "Starter",
      links: 20,
      amount: 100,
      description: "Perfect for individuals or small projects needing a few short URLs.",
      features: [
        "20 Short URLs",
        "Basic Analytics",
        "Custom Expiration Dates",
        "No Retainers, Flat Price",
      ],
      testimonial: {
        name: "Joe Doe",
        title: "Co-Founder & CEO at Doey",
        review: "Excellent, patient, professional, quick.",
      },
    },
    {
      label: "Most Popular",
      links: 50,
      amount: 500,
      description: "Ideal for businesses and teams needing more short URLs and advanced features.",
      features: [
        "50 Short URLs",
        "Advanced Analytics",
        "Custom Expiration Dates",
        "Priority Support",
        "Pause or Cancel Anytime",
      ],
      testimonial: {
        name: "Hannah Smith",
        title: "Content Creator at Smithy",
        review: "Smooth, fast, great designs.",
      },
    },
  ];

  // Load Razorpay script when the component mounts
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      setIsScriptLoaded(true);
    };

    script.onerror = () => {
      toast.error("Failed to load Razorpay checkout.");
      setIsScriptLoaded(false);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async (plan) => {
    if (!user) {
      toast.error("Please sign in to make a payment.");
      router.push("/signup");
      return;
    }

    if (!isScriptLoaded) {
      toast.error("Razorpay checkout is not loaded yet. Please try again.");
      return;
    }

    // Set loading state for the specific plan
    setLoading((prev) => ({ ...prev, [plan.links]: true }));

    try {
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.amount * 100,
          plan: `${plan.links}_links`,
        }),
      });

      const { orderId, error: orderError } = await response.json();
      if (orderError) {
        toast.error("Failed to initiate payment.");
        setLoading((prev) => ({ ...prev, [plan.links]: false }));
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_PUBLIC_KEY,
        amount: plan.amount * 100,
        currency: "INR",
        name: "ShortURL App",
        description: `Payment for ${plan.links} links`,
        order_id: orderId,
        handler: async (response) => {
          const verifyResponse = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              plan,
            }),
          });

          const verifyResult = await verifyResponse.json();
          if (verifyResult.success) {
            toast.success("Payment successful! Redirecting...");
            router.push("/");
          } else {
            toast.error("Payment verification failed.");
          }
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.emailAddresses[0]?.emailAddress || "",
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", () => {
        toast.error("Payment failed. Please try again.");
      });
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred during payment.");
    } finally {
      setLoading((prev) => ({ ...prev, [plan.links]: false }));
    }
  };

  if (!isLoaded) return <p className="text-gray-300 p-6">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-950 p-6 flex flex-col items-center justify-center">
      <Toaster position="top-right" />
      <h1 className="text-4xl font-bold text-gray-200 mb-12 text-center">
        Choose Your Plan
      </h1>
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl w-full">
        {plans.map((plan) => (
          <div
            key={plan.links}
            className={`relative flex-1 p-8 rounded-xl shadow-lg transition-all duration-300 ${
              plan.label === "Most Popular"
                ? "bg-pink-200 text-gray-900"
                : "bg-gray-800 text-gray-200"
            }`}
          >
            {/* Label */}
            <div
              className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-sm font-semibold ${
                plan.label === "Most Popular"
                  ? "bg-gray-900 text-pink-400"
                  : "bg-pink-400 text-gray-900"
              }`}
            >
              {plan.label}
            </div>

            {/* Plan Title and Description */}
            <h2 className="text-2xl font-bold mb-2">{plan.links} Links</h2>
            <p
              className={`text-sm mb-4 ${
                plan.label === "Most Popular" ? "text-gray-700" : "text-gray-400"
              }`}
            >
              {plan.description}
            </p>

            {/* Price */}
            <p className="text-3xl font-bold mb-6">₹{plan.amount}</p>

            {/* Testimonial */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <p
                className={`text-sm ${
                  plan.label === "Most Popular" ? "text-gray-700" : "text-gray-400"
                }`}
              >
                {plan.testimonial.name}, {plan.testimonial.title}
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <FaCheck
                    className={
                      plan.label === "Most Popular"
                        ? "text-gray-900"
                        : "text-green-500"
                    }
                  />
                  <span
                    className={
                      plan.label === "Most Popular" ? "text-gray-900" : "text-gray-200"
                    }
                  >
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {/* Pay Now Button */}
            <button
              onClick={() => handlePayment(plan)}
              disabled={loading[plan.links]}
              className={`w-full py-3 rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 ${
                plan.label === "Most Popular"
                  ? "bg-gray-900 text-pink-400 hover:bg-gray-800"
                  : "bg-pink-400 text-gray-900 hover:bg-pink-500"
              } ${loading[plan.links] ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading[plan.links] ? "Processing..." : "Buy Now"}
              <FaBolt />
            </button>
          </div>
        ))}
      </div>
      <p className="text-gray-400 text-center mt-8">
        Already have a plan?{" "}
        <a href="/" className="text-pink-300 hover:underline hover:text-pink-600">
          Generate URLs
        </a>
      </p>
    </div>
  );
};

export default PaymentPage;