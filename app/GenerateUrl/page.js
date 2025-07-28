// app/GenerateUrl/page.js
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast, { Toaster } from "react-hot-toast";

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
      router.push("/payment"); // Redirect to payment page
      return;
    }

    if (remainingLinks <= 0) {
      setError("You’ve used all your links. Please purchase a new plan.");
      router.push("/payment"); // Redirect to payment page
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
    <div className="flex flex-col gap-4 p-6 mt-8">
      <Toaster position="top-right" />
      {isLoaded ? (
        <>
          {user ? (
            <>
            {/**   <p className="text-gray-300">Signed in as: {user.emailAddresses[0]?.emailAddress}</p>*/}

              <p className="text-gray-300">
                You have {remainingLinks} links remaining in your plan.
              </p>
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
                className={`w-full sm:w-[30em] rounded-sm px-6 py-4 border text-gray-600 text-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error && url && !isValidUrl(url) ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Paste your URL here!"
              />
              <div>
                <label htmlFor="expiresAt" className="block text-gray-300 mb-2">
                  Expiration Date (Optional)
                </label>
                <DatePicker
                  id="expiresAt"
                  selected={expiresAt}
                  onChange={(date) => setExpiresAt(date)}
                  showTimeSelect
                  dateFormat="dd-MM-yyyy HH:mm"
                  placeholderText="dd-mm-yyyy --:--"
                  className="w-full sm:w-[30em] rounded-sm px-6 py-4 border border-black text-gray-600 text-lg bg-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                  calendarClassName="bg-white text-gray-800 border-black rounded-lg"
                  popperClassName="bg-white text-gray-800 border-black"
                />
              </div>
              <button
                onClick={generateShortUrl}
                disabled={loading}
                className={`rounded-xl p-4 text-lg cursor-pointer bg-radial from-pink-400 from-40% to-fuchsia-700 text-gray-900 ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                }`}
              >
                {loading ? "Creating..." : "Make it better!"}
              </button>
              {loading && (
                <p className="text-gray-300 text-lg animate-pulse">
                  Please wait while we create...
                </p>
              )}
              {error && !loading && <p className="text-red-500">{error}</p>}
              {shortUrl && !loading && (
                <div className="flex flex-col gap-4">
                  <p className="text-gray-300">Short Url</p>
                  <div className="flex gap-2">
                    <a href={shortUrl} target="_blank" className="text-blue-500">
                      {shortUrl}
                    </a>
                    <button
                      onClick={() => copyToClipboard(shortUrl)}
                      className="bg-blue-500 text-white rounded-xl p-2"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className=" text-gray-300 flex flex-col lg:flex-row gap-4">
              <input
                className="w-full sm:w-[30em] rounded-xl p-6 border border-gray-300 text-gray-300 text-lg bg-gray-800"
                placeholder="Paste your URL here!"
              />
              <a href="/signup" className="text-pink-200 bg-pink-600 text-center p-6 rounded-2xl">
                Short URL
              </a>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-300">Loading...</p>
      )}
    </div>
  );
};

export default GenerateUrl;