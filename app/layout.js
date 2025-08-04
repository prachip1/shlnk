import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import Dashboard from "./dashboard/page";
import Navbar from "./Navbar/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shlnk - URL Shortener",
  description: "Create short, secure, and trackable URLs with Shlnk",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`bg-gray-950 text-gray-300 ${geistSans.variable} ${geistMono.variable}`}>
          <Navbar />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}