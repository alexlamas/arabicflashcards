"use client";

import { WifiSlash } from "@phosphor-icons/react";

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md p-8 text-center">
        <div className="mb-6">
          <WifiSlash className="mx-auto h-24 w-24 text-slate-400" />
        </div>
        <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
          You&apos;re Offline
        </h1>
        <p className="mb-8 text-slate-600 dark:text-slate-400">
          It looks like you&apos;ve lost your internet connection. Some features may be unavailable until you&apos;re back online.
        </p>
        <button 
          onClick={handleReload}
          className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Reload page to check connection"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}