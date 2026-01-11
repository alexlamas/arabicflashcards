"use client";

import React, { useState } from "react";
import { clsx } from "clsx";
import { SearchBar } from "./SearchBar";
import { MagnifyingGlass, CaretDown, X } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const getTabDot = (dot?: "learning" | "learned" | null, size = "size-2") => {
    if (dot === "learned") {
      return <div className={`${size} rounded-full bg-gradient-to-r from-emerald-500 to-teal-500`} />;
    }
    if (dot === "learning") {
      return <div className={`${size} rounded-full bg-gradient-to-r from-emerald-300 to-teal-300`} />;
    }
    return null;
  };

  const activeTabConfig = tabs?.find(t => t.key === activeTab);

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 w-full max-w-4xl pt-3 px-4 md:px-6 z-40 bg-white">
      <div className="flex items-center gap-2 p-1 border rounded-full bg-gray-50">

        {/* Mobile: Collapsible search */}
        {onSearchChange && (
          <div className="md:hidden">
            {mobileSearchOpen ? (
              <div className="flex items-center gap-1">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder || "Search..."}
                    value={searchTerm || ""}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 pr-3 rounded-full bg-white w-32"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => {
                    setMobileSearchOpen(false);
                    onSearchChange("");
                  }}
                  className="p-2 rounded-full hover:bg-gray-200 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-500"
              >
                <MagnifyingGlass className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Desktop: Full search bar */}
        {onSearchChange && (
          <div className="hidden md:block">
            <SearchBar
              value={searchTerm || ""}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </div>
        )}

        {/* Mobile: Tab dropdown (hidden when search is open) */}
        {tabs && onTabChange && !mobileSearchOpen && (
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-200/70 text-sm font-medium">
                  {activeTabConfig && getTabDot(activeTabConfig.dot)}
                  {activeTabConfig?.label}
                  {activeTabConfig?.count !== undefined && (
                    <span className="text-xs text-neutral-500">{activeTabConfig.count}</span>
                  )}
                  <CaretDown className="h-3 w-3 text-gray-500" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {tabs.map((tab) => (
                  <DropdownMenuItem
                    key={tab.key}
                    onClick={() => onTabChange(tab.key)}
                    className={clsx(
                      "flex items-center gap-2",
                      activeTab === tab.key && "bg-gray-100"
                    )}
                  >
                    {getTabDot(tab.dot)}
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="text-xs text-neutral-400 ml-auto">{tab.count}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Desktop: Full tabs */}
        {tabs && onTabChange && (
          <div className="hidden md:inline-flex items-center rounded-full p-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={clsx(
                  "px-4 py-1.5 text-sm rounded-full font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap",
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
          <div className="inline-flex gap-2 items-center ml-auto flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
