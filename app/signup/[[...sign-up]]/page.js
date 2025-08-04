"use client";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Create Account</h2>
            <p className="text-gray-400">Join us to start shortening your URLs</p>
          </div>
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none p-0",
                headerTitle: "text-gray-100 text-xl font-semibold",
                headerSubtitle: "text-gray-400",
                formButtonPrimary: "bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-600 hover:to-fuchsia-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200",
                formFieldInput: "bg-gray-800/50 border-gray-700 text-gray-100 focus:border-pink-500 focus:ring-pink-500 rounded-lg",
                formFieldLabel: "text-gray-300",
                footerActionLink: "text-pink-400 hover:text-pink-300",
                dividerLine: "bg-gray-700",
                dividerText: "text-gray-400",
                socialButtonsBlockButton: "bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50 rounded-lg",
                formFieldLabelRow: "text-gray-300",
                formFieldInputShowPasswordButton: "text-gray-400 hover:text-gray-300"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 