// app/dashboard/page.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Chart } from "chart.js/auto";
import axios from "axios";
import { FaExternalLinkAlt } from "react-icons/fa";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [links, setLinks] = useState([]);
  const [clickData, setClickData] = useState({ labels: [], data: [] });
  const chartInstanceRef = useRef(null); // Store the chart instance

  useEffect(() => {
    if (!isLoaded || !user) return;

    async function fetchLinks() {
      try {
        const response = await axios.get(`/api/links?userId=${user.id}`, { withCredentials: true });
        const userLinks = response.data.links;
        setLinks(userLinks);

        const clicksByDay = userLinks.reduce((acc, link) => {
          link.clickDetails.forEach((click) => {
            const day = new Date(click.timestamp).toLocaleDateString();
            acc[day] = (acc[day] || 0) + 1;
          });
          return acc;
        }, {});
        setClickData({
          labels: Object.keys(clicksByDay),
          data: Object.values(clicksByDay),
        });
      } catch (error) {
        console.error("Error fetching links:", error);
      }
    }
    fetchLinks();
  }, [isLoaded, user]);

  useEffect(() => {
    if (clickData.labels.length && clickData.data.length) {
      // Destroy the previous chart instance if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }

      // Create a new chart
      const canvas = document.getElementById("clicksChart");
      if (canvas) {
        chartInstanceRef.current = new Chart(canvas, {
          type: "bar",
          data: {
            labels: clickData.labels.map(label =>
              label.length > 10 ? label.substring(0, 10) + "..." : label
            ),
            datasets: [
              {
                label: "Clicks",
                data: clickData.data,
                backgroundColor: "rgba(255, 105, 180,0.5)",
                borderColor: "rgba(255, 182, 193, 1)",
                borderWidth: 1,
                barThickness: 60,
                barPercentage: 0.9,
                categoryPercentage: 0.8,
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
          },
        });
      }
    }

    // Cleanup on unmount or when clickData changes
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [clickData]);

  if (!isLoaded) return <p className="text-gray-300 p-6">Loading...</p>;
  if (!user) return <p className="text-gray-300 p-6">Please sign in.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl text-gray-300 mb-4">Dashboard</h1>
      <div className="flex flex-col md:flex-row gap-6 mt-8">
        {/* Chart Section */}
        <div className="md:w-7/10">
          <h2  className="text-base text-gray-400 mb-2 bg-gray-900 px-4 py-2 rounded-lg w-50">Click Analytics</h2>
          <canvas
            id="clicksChart"
            className="w-full"
            style={{ width: "600px", height: "200px" }}
          ></canvas>
        </div>
        {/* Links Section */}
        <div className="md:w-3/10 overflow-y-auto">
          <h2 className="text-xl text-gray-400 mb-2 bg-gray-900 px-4 py-2 rounded-lg w-auto">Your Links</h2>
          {links.length === 0 ? (
            <p className="text-gray-300">No links yet.</p>
          ) : (
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link._id} className="text-gray-300 border-b border-gray-700 pb-2 flex justify-between items-center">
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-gray-400">New URL:</p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${link.shortUrl}`}
                      target="_blank"
                      className="text-gray-200 hover:underline text-sm"
                    >
                     <span className="flex gap-2 text-sm">{`${process.env.NEXT_PUBLIC_BASE_URL}/api/redirect/${link.shortUrl}`} <FaExternalLinkAlt className="text-sm" /></span> 
                    </a>
                    <p className="text-sm text-gray-400">Original URL:</p><a href="{link.originalUrl}" target="_blank" className="text-gray-200 hover:underline text-sm">{link.originalUrl}</a>
                    <p className="text-sm text-gray-400">Clicks: {link.clicks}</p>
                    <p className="text-sm text-gray-400">Expires: {link.expiresAt ? new Date(link.expiresAt).toLocaleString() : "Never"}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await axios.delete(`/api/links/${link._id}?userId=${user.id}`, { withCredentials: true });
                        setLinks(links.filter((l) => l._id !== link._id));
                      } catch (error) {
                        console.error("Error deleting link:", error);
                      }
                    }}
                    className="bg-indigo-300 border-1 border-indigo-600 text-gray-800 font-semibold text-base rounded-xl px-4 py-2 cursor-pointer hover:bg-indigo-400"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}