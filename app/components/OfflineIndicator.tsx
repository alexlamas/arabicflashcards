"use client";

import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
    } else {
      // Delay hiding the indicator to show connection restored message
      const timer = setTimeout(() => setShowOffline(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-auto z-50">
      <div 
        className={`rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 transition-all duration-300 ${
          isOnline 
            ? 'bg-green-500 text-white' 
            : 'bg-amber-500 text-white'
        }`}
      >
        <svg 
          className="h-5 w-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          {isOnline ? (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 12.55a11.23 11.23 0 012.9-1.8A10.9 10.9 0 0112 10c1.4 0 2.8.3 4.1.7 1 .4 2 .9 2.9 1.8m-7 4c.828 0 1.5-.448 1.5-1s-.672-1-1.5-1-1.5.448-1.5 1 .672 1 1.5 1zm0 0V20m-7-4a7 7 0 0114 0M3 8.5A11.43 11.43 0 0112 5c3.636 0 6.928 1.5 9 4.5"
            />
          ) : (
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
            />
          )}
        </svg>
        <span className="text-sm font-medium">
          {isOnline ? "Connection restored" : "You&apos;re offline - using cached data"}
        </span>
      </div>
    </div>
  );
}