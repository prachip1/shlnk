// app/dashboard/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chart } from "chart.js/auto";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { MdContentCopy } from "react-icons/md";
import { FiBarChart2, FiLink, FiClock, FiTrash2, FiTrendingUp } from "react-icons/fi";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [links, setLinks] = useState([]);
  const [clickData, setClickData] = useState({ labels: [], data: [] });
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCanvasMounted, setIsCanvasMounted] = useState(false);
  const chartInstanceRef = useRef(null);

  // Fetch user links and plan data
  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchData() {
      setLoading(true);
      try {
        const linksResponse = await axios.get(`/api/links?userId=${user.id}`, { withCredentials: true });
        const userLinks = linksResponse.data.links;
        setLinks(userLinks);

        const clicksByDay = userLinks.reduce((acc, link) => {
          link.clickDetails.forEach((click) => {
            const day = new Date(click.timestamp).toLocaleDateString();
            acc[day] = (acc[day] || 0) + 1;
          });
          return acc;
        }, {});
        const newClickData = {
          labels: Object.keys(clicksByDay),
          data: Object.values(clicksByDay),
        };
        console.log("clickData - Labels:", newClickData.labels, "Data:", newClickData.data);
        setClickData(newClickData);

        const planResponse = await fetch(`/api/get-user-plan?userId=${user.id}`);
        const planData = await planResponse.json();
        setUserData(planData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isLoaded, user]);

  // Set isCanvasMounted when the canvas is available
  useEffect(() => {
    if (loading) return;

    const checkCanvas = () => {
      const canvas = document.getElementById("clicksChart");
      if (canvas) {
        console.log("Canvas element mounted:", canvas);
        setIsCanvasMounted(true);
      } else {
        console.log("Canvas element not found, retrying...");
        setTimeout(checkCanvas, 100); // Retry after 100ms
      }
    };

    checkCanvas();
  }, [loading]);

  // Render the chart
  useEffect(() => {
    if (!isCanvasMounted || !clickData.labels.length || !clickData.data.length) {
      console.log("Chart not initialized - Conditions not met:", {
        isCanvasMounted,
        hasLabels: clickData.labels.length,
        hasData: clickData.data.length,
      });
      return;
    }

    console.log("Initializing chart with clickData:", clickData);

    if (chartInstanceRef.current) {
      console.log("Destroying previous chart instance");
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const canvas = document.getElementById("clicksChart");
    if (canvas) {
      console.log("Canvas found for chart initialization:", canvas);
      try {
        chartInstanceRef.current = new Chart(canvas, {
          type: "bar",
          data: {
            labels: clickData.labels.map((label) =>
              label.length > 10 ? label.substring(0, 10) + "..." : label
            ),
            datasets: [
              {
                label: "Clicks",
                data: clickData.data,
                backgroundColor: "rgba(236, 72, 153, 0.6)",
                borderColor: "rgba(236, 72, 153, 1)",
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 30,
                barPercentage: 0.6,
                categoryPercentage: 0.6,
              },
            ],
          },
          options: {
            indexAxis: "y",
            scales: {
              x: {
                beginAtZero: true,
                ticks: {
                  color: "#d1d5db",
                  font: { size: 12 },
                },
                grid: {
                  color: "#374151",
                },
              },
              y: {
                ticks: {
                  color: "#d1d5db",
                  font: { size: 12 },
                },
                grid: {
                  display: false,
                },
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: "#d1d5db",
                  font: { size: 12 },
                },
              },
            },
            layout: {
              padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              },
            },
            responsive: true,
            maintainAspectRatio: false,
          },
        });
        console.log("Chart successfully initialized:", chartInstanceRef.current);
      } catch (error) {
        console.error("Error initializing chart:", error);
      }
    } else {
      console.error("Canvas element not found during chart initialization!");
    }

    return () => {
      if (chartInstanceRef.current) {
        console.log("Cleaning up chart instance on unmount");
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [clickData, isCanvasMounted]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
  };

  if (!isLoaded) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-300 text-xl mb-4">Please sign in to access your dashboard.</p>
                 <Link href="/signin" className="px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-lg hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200">
           Sign In
         </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center gap-3">
            <FiBarChart2 className="w-8 h-8 text-pink-400" />
            Dashboard
          </h1>
          <p className="text-gray-400">Manage your short URLs and track their performance</p>
        </div>

        {/* Account Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-pink-500/10 rounded-lg">
                <FiLink className="w-6 h-6 text-pink-400" />
              </div>
              <span className="text-sm text-gray-400">Remaining</span>
            </div>
            <p className="text-3xl font-bold text-gray-100">{userData?.remainingLinks || 0}</p>
            <p className="text-gray-400 text-sm">Links Available</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-sm text-gray-400">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-100">{links.length}</p>
            <p className="text-gray-400 text-sm">Links Created</p>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FiClock className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-sm text-gray-400">Plan</span>
            </div>
            <p className="text-xl font-bold text-gray-100">
              {userData?.purchasedPlan?.links || 0} Links
            </p>
            <p className="text-gray-400 text-sm">
              ₹{userData?.purchasedPlan?.amount || 0}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {userData?.remainingLinks <= 0 && (
          <div className="mb-8">
            <button
              onClick={() => router.push("/payment")}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-lg hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200 font-medium"
            >
              Purchase New Plan
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center gap-2">
                <FiTrendingUp className="w-5 h-5 text-pink-400" />
                Click Analytics
              </h2>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : clickData?.labels.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>No click data available yet.</p>
                </div>
              ) : (
                <div className="w-full h-64">
                  <canvas id="clicksChart" className="w-full h-full"></canvas>
                </div>
              )}
            </div>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-6 flex items-center gap-2">
                <FiLink className="w-5 h-5 text-pink-400" />
                Your Links
              </h2>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-8">
                  <FiLink className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No links created yet.</p>
                  <Link 
                    href="/" 
                    className="inline-block mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-lg hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200 text-sm"
                  >
                    Create Your First Link
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {links.map((link) => (
                    <div
                      key={link._id}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-400 mb-1">Short URL</p>
                          <div className="flex items-center gap-2">
                            <a
                              href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${link.shortUrl}`}
                              target="_blank"
                              className="text-pink-400 hover:text-pink-300 text-sm truncate"
                            >
                              {`${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${link.shortUrl}`}
                            </a>
                            <FaExternalLinkAlt className="text-xs flex-shrink-0" />
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${link.shortUrl}`
                            )
                          }
                          className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors flex-shrink-0"
                          title="Copy URL"
                        >
                          <MdContentCopy className="w-3 h-3" />
                        </button>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-400 mb-1">Original URL</p>
                        <a
                          href={link.originalUrl}
                          target="_blank"
                          className="text-gray-300 hover:text-pink-400 text-sm truncate block"
                        >
                          {link.originalUrl}
                        </a>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Clicks: {link.clicks}</span>
                        <span>
                          {link.expiresAt ? new Date(link.expiresAt).toLocaleDateString() : "Never expires"}
                        </span>
                      </div>
                      
                      <button
                        onClick={async () => {
                          try {
                            await axios.delete(`/api/links/${link._id}?userId=${user.id}`, {
                              withCredentials: true,
                            });
                            setLinks(links.filter((l) => l._id !== link._id));
                            toast.success("Link deleted successfully!");
                          } catch (error) {
                            console.error("Error deleting link:", error);
                            toast.error("Failed to delete link.");
                          }
                        }}
                        className="mt-3 w-full px-3 py-1.5 bg-red-500/10 text-red-400 rounded border border-red-500/20 hover:bg-red-500/20 transition-colors text-xs flex items-center justify-center gap-1"
                      >
                        <FiTrash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}