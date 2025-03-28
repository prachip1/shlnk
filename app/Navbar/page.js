// app/navbar/page.js
"use client";

import React from "react";
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
    const { user, isLoaded } = useUser();

    // Show a loading state until isLoaded is true
    if (!isLoaded) {
        return (
            <nav className="flex justify-between items-center p-4 h-16 mt-4">
               
                <Link href="/" className="flex gap-2 text-base font-medium text-gray-300">
                URLToSmall
                </Link>
                <div className="text-gray-300">Loading...</div>
            </nav>
        );
    }

    return (
        <nav className="flex justify-between items-center p-4 h-16 mt-4">
            {/* Left Side: Logo */}
            <Link href="/" className="flex gap-2 items-center text-base font-semibold text-gray-300">
            <img src="urllogo.png" className="w-[30px] h-[30px]"/> <p>URLtoSmall</p>
            </Link>
            {user && (
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="p-4 rounded-xl text-gray-200 hover:underline">
                        Dashboard
                    </Link>
                    <button className="p-2 rounded-lg ml-4 text-gray-200 hover:underline">
                        <Link href="/">Short URL</Link>
                    </button>
                </div>
            )}

            {/* Right Side: Auth Links */}
            <div className="flex items-center gap-4">
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                  {/**   <Link
                        href="/signup"
                        className="bg-gray-300 text-gray-950 rounded-lg hover:text-gray-800 p-2"
                    >
                        Short URL
                    </Link>*/}
                    <Link
                        href="/signin"
                        className="bg-gray-300 text-gray-950 rounded-lg hover:text-gray-800 p-2"
                    >
                        Log In
                    </Link>
                </SignedOut>
            </div>
        </nav>
    );
}