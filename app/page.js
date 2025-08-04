"use client";

import GenerateUrl from "./GenerateUrl/page";
import HeroSection from "./HeroSection/page";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        <HeroSection />
        <GenerateUrl />
      </div>
    </div>
  );
}
