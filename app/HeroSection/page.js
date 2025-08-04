import React from 'react';

const HeroSection = () => {
    return (
        <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="mb-8">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-6 leading-tight">
                    That long URL looks 
                    <span className="bg-gradient-to-r from-pink-400 to-fuchsia-600 bg-clip-text text-transparent"> suspicious</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                    Create a shorter one, just copy, paste, generate. Now share.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Secure & Fast</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span>Analytics Included</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-600 rounded-full"></div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>Custom Expiry</span>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;