// app/dashboard/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Chart } from "chart.js/auto";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import { MdContentCopy } from "react-icons/md";

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
                backgroundColor: "rgba(255, 105, 180, 0.5)",
                borderColor: "rgba(255, 182, 193, 1)",
                borderWidth: 1,
                barThickness: 30, // Reduced for better proportion
              barPercentage: 0.6, // Reduced to add gaps between bars
              categoryPercentage: 0.6, // Reduced to add gaps between categories
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
                  color: "#4b5563",
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

  if (!isLoaded) return <p className="text-gray-300 p-6">Loading...</p>;
  if (!user) return <p className="text-gray-300 p-6">Please sign in.</p>;

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl text-gray-300 mb-4">Dashboard</h1>

      {/* Account Overview Section */}
      <div className="mb-8">
        <h2 className="text-xl text-gray-400 mb-2 bg-gray-900 px-4 py-2 rounded-lg w-auto">
          Account Overview
        </h2>
        {loading ? (
          <p className="text-gray-300 animate-pulse">Loading account data...</p>
        ) : userData?.purchasedPlan ? (
          <div className="flex flex-col gap-2 text-gray-300">
            <p>
              Plan: {userData.purchasedPlan.links} Links for ₹{userData.purchasedPlan.amount}
            </p>
            <p>Remaining Links: {userData.remainingLinks || 0}</p>
            <p>Total Links Generated: {(userData.links || []).length}</p>
            {userData.remainingLinks <= 0 && (
              <button
                onClick={() => router.push("/payment")}
                className="mt-4 bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600"
              >
                Purchase a New Plan
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-gray-300">
              No plan purchased yet.
            </p>
            <button
              onClick={() => router.push("/payment")}
              className="bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600"
            >
              Purchase a Plan
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Chart Section */}
        <div className="lg:w-7/12">
          <h2 className="text-base text-gray-400 mb-2 bg-gray-900 px-4 py-2 rounded-lg w-auto">
            Click Analytics
          </h2>
          {loading ? (
            <p className="text-gray-300 animate-pulse">Loading chart...</p>
          ) : clickData?.labels.length === 0 ? (
            <p className="text-gray-300">No click data available.</p>
          ) : (
            <div className="w-full h-[300px] bg-gray-800 rounded-lg p-4">
              <canvas id="clicksChart" className="w-full h-full"></canvas>
            </div>
          )}
        </div>

        {/* Links Section */}
        <div className="lg:w-5/12 overflow-y-auto max-h-[400px]">
          <h2 className="text-xl text-gray-400 mb-2 bg-gray-900 px-4 py-2 rounded-lg w-auto">
            Your Links
          </h2>
          {loading ? (
            <p className="text-gray-300 animate-pulse">Loading links...</p>
          ) : links.length === 0 ? (
            <p className="text-gray-300">No links yet.</p>
          ) : (
            <ul className="space-y-4">
              {links.map((link) => (
                <li
                  key={link._id}
                  className="text-gray-300 border-b border-gray-700 pb-2 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-gray-400">New URL:</p>
                      <div className="flex items-center gap-2">
                        <a
                          href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${link.shortUrl}`}
                          target="_blank"
                          className="text-gray-200 hover:underline text-sm truncate max-w-[200px]"
                        >
                          {`${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${link.shortUrl}`}
                        </a>
                        <FaExternalLinkAlt className="text-sm flex-shrink-0" />
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${link.shortUrl}`
                            )
                          }
                          className="flex gap-2 bg-gray-200 text-gray-950 rounded px-4 py-2 cursor-pointer text-sm"
                        >
                         <MdContentCopy /> Copy
                        </button>
                      </div>
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
                      className="bg-indigo-300 border-1 border-indigo-600 text-gray-800 font-semibold text-base rounded px-4 py-2 cursor-pointer hover:bg-indigo-400"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-400">Original URL:</p>
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      className="text-gray-200 hover:underline text-sm truncate max-w-[300px]"
                    >
                      {link.originalUrl}
                    </a>
                  </div>
                  <p className="text-sm text-gray-400">Clicks: {link.clicks}</p>
                  <p className="text-sm text-gray-400">
                    Expires: {link.expiresAt ? new Date(link.expiresAt).toLocaleString() : "Never"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}