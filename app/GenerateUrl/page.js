// app/GenerateUrl/page.js
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";
import { FiLink, FiClock, FiCopy, FiExternalLink } from "react-icons/fi";

const GenerateUrl = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(null);
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState(null);
  const [remainingLinks, setRemainingLinks] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUserPlan = async () => {
        try {
          const response = await fetch(`/api/get-user-plan?userId=${user.id}`);
          const data = await response.json();
          if (data.purchasedPlan) {
            setPurchasedPlan(data.purchasedPlan);
            setRemainingLinks(data.remainingLinks || 0);
          }
        } catch (error) {
          console.error("Error fetching user plan:", error);
          toast.error("Failed to load user plan.");
        }
      };
      fetchUserPlan();
    }
  }, [user]);

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  };

  const generateShortUrl = async () => {
    if (!isLoaded) {
      setError("Loading user data...");
      return;
    }

    if (!user) {
      setError("Please sign in to shorten URLs.");
      return;
    }

    if (!purchasedPlan) {
      toast.error("Please purchase a plan to generate short URLs.");
      router.push("/payment");
      return;
    }

    if (remainingLinks <= 0) {
      setError("You've used all your links. Please purchase a new plan.");
      router.push("/payment");
      return;
    }

    if (!url) {
      toast.error("URL is required");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      toast.error("Invalid URL format");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setShortUrl("");

      const response = await axios.post(
        "/api/shorturl",
        { url, userId: user.id, expiresAt: expiresAt ? expiresAt.toISOString() : null },
        { withCredentials: true }
      );
      setShortUrl(response.data.shortUrl);
      setRemainingLinks((prev) => prev - 1);
      toast.success("Short URL generated successfully!");
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.error || "Failed to generate short URL. Please try again.");
      toast.error(error.response?.data?.error || "Failed to generate short URL.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Toaster position="top-right" />
      
      {isLoaded ? (
        <>
          {user ? (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-xl">
              {/* Plan Status */}
              <div className="mb-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 font-medium">Remaining Links</p>
                    <p className="text-2xl font-bold text-pink-400">{remainingLinks}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Plan</p>
                    <p className="text-gray-300 font-medium">
                      {purchasedPlan?.links} Links
                    </p>
                  </div>
                </div>
              </div>

              {/* URL Input */}
              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-3 flex items-center gap-2">
                  <FiLink className="w-4 h-4" />
                  Enter your URL
                </label>
                <div className="relative">
                  <input
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (e.target.value && !isValidUrl(e.target.value)) {
                        setError("Please enter a valid URL (e.g., https://example.com)");
                      } else {
                        setError("");
                      }
                    }}
                    className={`w-full px-4 py-4 rounded-xl border-2 text-gray-100 text-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 ${
                      error && url && !isValidUrl(url) ? "border-red-500" : "border-gray-700"
                    }`}
                    placeholder="https://example.com"
                  />
                </div>
                {error && url && !isValidUrl(url) && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>

              {/* Expiration Date */}
              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-3 flex items-center gap-2">
                  <FiClock className="w-4 h-4" />
                  Expiration Date (Optional)
                </label>
                <DatePicker
                  selected={expiresAt}
                  onChange={(date) => setExpiresAt(date)}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy HH:mm"
                  placeholderText="Select date and time"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-700 text-gray-100 text-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  calendarClassName="bg-gray-800 text-gray-100 border-gray-700 rounded-xl"
                  popperClassName="bg-gray-800 text-gray-100 border-gray-700"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={generateShortUrl}
                disabled={loading}
                className={`w-full rounded-xl py-4 text-lg font-semibold cursor-pointer bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white transition-all duration-200 ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:from-pink-600 hover:to-fuchsia-700 hover:shadow-lg hover:shadow-pink-500/25"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  "Generate Short URL"
                )}
              </button>

              {/* Generated URL */}
              {shortUrl && !loading && (
                <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
                  <p className="text-gray-300 font-medium mb-3">Your Short URL</p>
                  <div className="flex items-center gap-3">
                    <a 
                      href={shortUrl} 
                      target="_blank" 
                      className="flex-1 text-pink-400 hover:text-pink-300 transition-colors break-all"
                    >
                      {shortUrl}
                    </a>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(shortUrl)}
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                        title="Copy URL"
                      >
                        <FiCopy className="w-4 h-4" />
                      </button>
                      <a
                        href={shortUrl}
                        target="_blank"
                        className="p-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
                        title="Open URL"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-100 mb-2">Ready to shorten URLs?</h3>
                <p className="text-gray-400">Sign up to get started with your first short URL</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  className="flex-1 px-4 py-4 rounded-xl border-2 border-gray-700 text-gray-100 text-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://example.com"
                  disabled
                />
                <a 
                  href="/signup" 
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200 text-center"
                >
                  Get Started
                </a>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-xl text-center">
          <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default GenerateUrl;