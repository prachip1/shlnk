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
import Image from "next/image";
import { FiHome, FiBarChart2 } from "react-icons/fi";

export default function Navbar() {
    const { user, isLoaded } = useUser();

    // Show a loading state until isLoaded is true
    if (!isLoaded) {
        return (
            <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/" className="flex items-center gap-3 text-xl font-bold text-gray-100">
                            <Image src="/urllogo.png" width={32} height={32} alt="Shlnk" className="rounded-lg" />
                            <span>Shlnk</span>
                        </Link>
                        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left Side: Logo */}
                    <Link href="/" className="flex items-center gap-3 text-xl font-bold text-gray-100 hover:text-pink-400 transition-colors">
                        <Image src="/urllogo.png" width={32} height={32} alt="Shlnk" className="rounded-lg" />
                        <span>Shlnk</span>
                    </Link>

                    {/* Center: Navigation Links (for signed in users) */}
                    {user && (
                        <div className="hidden md:flex items-center gap-1">
                            <Link 
                                href="/" 
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-pink-400 hover:bg-gray-800/50 transition-all duration-200"
                            >
                                <FiHome className="w-4 h-4" />
                                <span>Home</span>
                            </Link>
                            <Link 
                                href="/dashboard" 
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-pink-400 hover:bg-gray-800/50 transition-all duration-200"
                            >
                                <FiBarChart2 className="w-4 h-4" />
                                <span>Dashboard</span>
                            </Link>
                        </div>
                    )}

                    {/* Right Side: Auth */}
                    <div className="flex items-center gap-3">
                        <SignedIn>
                            <UserButton 
                                appearance={{
                                    elements: {
                                        avatarBox: "w-8 h-8",
                                        userButtonPopoverCard: "bg-gray-800 border-gray-700",
                                        userButtonPopoverActionButton: "text-gray-300 hover:bg-gray-700",
                                        userButtonPopoverActionButtonText: "text-gray-300"
                                    }
                                }}
                            />
                        </SignedIn>
                        <SignedOut>
                            <Link
                                href="/signin"
                                className="px-4 py-2 text-gray-300 hover:text-pink-400 transition-colors font-medium"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/signup"
                                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-fuchsia-600 text-white rounded-lg hover:from-pink-600 hover:to-fuchsia-700 transition-all duration-200 font-medium"
                            >
                                Get Started
                            </Link>
                        </SignedOut>
                    </div>
                </div>
            </div>
        </nav>
    );
}