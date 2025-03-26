"use client";

import GenerateUrl from "./GenerateUrl/page";
import HeroSection from "./HeroSection/page";

export default function Home() {


  return (
    <div className="bg-gray-950 flex flex-col justify-center items-center">
      <HeroSection />
      <GenerateUrl />

    </div>
  );
}
