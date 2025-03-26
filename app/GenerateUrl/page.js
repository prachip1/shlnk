// app/GenerateUrl/page.js
"use client";

import React, { useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const GenerateUrl = () => {
  const { user, isLoaded } = useUser();
  const [url, setUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(null); // Use null for DatePicker
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const generateShortUrl = async () => {
    if (!isLoaded) {
      setError("Loading user data...");
      return;
    }

    if (!user) {
      setError("Please sign in to shorten URLs.");
      return;
    }

    if (!url) {
      alert("URL is required");
      return;
    }

    try {
      setLoading(true); // Set loading to true
      setError(""); // Clear any previous errors
      setShortUrl(""); // Clear previous short URL

      const response = await axios.post(
        "/api/shorturl",
        { url, userId: user.id, expiresAt: expiresAt ? expiresAt.toISOString() : null },
        { withCredentials: true }
      );
      setShortUrl(response.data.shortUrl);
    } catch (error) {
      console.error(error);
      setError("Failed to generate short URL. Please try again.");
    } finally {
      setLoading(false); // Set loading to false when done
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => alert("Copied!"));
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      {isLoaded ? (
        <>
          {user ? (
            <>
              <p className="text-gray-300">Signed in as: {user.emailAddresses[0]?.emailAddress}</p>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-[30em] rounded-xl p-6 border border-gray-300 text-gray-300 text-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-[30em] rounded-xl p-6 border border-gray-300 text-gray-300 text-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  calendarClassName="bg-gray-800 text-gray-300 border-gray-300"
                  popperClassName="text-gray-300"
                />
              </div>
              <button
                onClick={generateShortUrl}
                disabled={loading} // Disable button while loading
                className={`rounded-xl p-2 cursor-pointer bg-radial from-pink-400 from-40% to-fuchsia-700 text-pink-200 ${
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
            <div className="text-gray-300 flex gap-4">
              <input
                className="w-[30em] rounded-xl p-6 border border-gray-300 text-gray-300 text-lg bg-gray-800"
                placeholder="Paste your URL here!"
              />
              <a href="/signup" className="text-pink-200 bg-pink-600 p-6 rounded-2xl">
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