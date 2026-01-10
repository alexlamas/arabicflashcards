"use client";

import React from "react";
import { clsx } from "clsx";
import { SearchBar } from "./SearchBar";

export interface TabConfig {
  key: string;
  label: string;
  count?: number;
  dot?: "learning" | "learned" | null;
}

interface SubNavProps {
  // Search
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Tabs
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;

  // Right side actions
  actions?: React.ReactNode;
}

export function SubNav({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  tabs,
  activeTab,
  onTabChange,
  actions,
}: SubNavProps) {
  const getTabDot = (dot?: "learning" | "learned" | null) => {
    if (dot === "learned") {
      return <div className="size-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />;
    }
    if (dot === "learning") {
      return <div className="size-2 rounded-full bg-gradient-to-r from-emerald-300 to-teal-300" />;
    }
    return null;
  };

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl pt-3 px-6 z-40 bg-white">
      <div className="flex items-center gap-2 p-1 border rounded-full bg-gray-50">
        {/* Search */}
        {onSearchChange && (
          <SearchBar
            value={searchTerm || ""}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}

        {/* Tabs */}
        {tabs && onTabChange && (
          <div className="inline-flex items-center rounded-full p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={clsx(
                  "px-4 py-1.5 text-sm rounded-full font-medium transition-colors flex items-center gap-1.5",
                  activeTab === tab.key
                    ? "bg-gray-200/70 shadow-sm text-neutral-900"
                    : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                {getTabDot(tab.dot)}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={clsx(
                    "text-xs pt-0.5",
                    activeTab === tab.key ? "text-neutral-500" : "text-neutral-400"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Right side actions */}
        {actions && (
          <div className="inline-flex gap-2 items-center ml-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
