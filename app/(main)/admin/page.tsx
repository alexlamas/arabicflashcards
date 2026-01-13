"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, BookOpen, PenLine, TrendingUp } from "lucide-react";

interface AdminStats {
  wau: number;
  wauChange: number;
  signupsThisWeek: number;
  signupsLastWeek: number;
  reviewsThisWeek: number;
  reviewsLastWeek: number;
  customWordsThisWeek: number;
  customWordsLastWeek: number;
  totalUsers: number;
  totalReviews: number;
  totalCustomWords: number;
}

function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  loading?: boolean;
}) {
  const changePercent = change !== undefined && change !== 0
    ? Math.round(((value - change) / (change || 1)) * 100)
    : 0;
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;

  return (
    <div className="bg-white border rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-gray-600" />
        </div>
        {change !== undefined && changePercent !== 0 && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            isPositive ? "bg-emerald-100 text-emerald-700" :
            isNegative ? "bg-red-100 text-red-700" :
            "bg-gray-100 text-gray-600"
          }`}>
            {isPositive ? "+" : ""}{changePercent}%
          </span>
        )}
      </div>
      <div className="text-2xl font-semibold text-gray-900 mb-1">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : value.toLocaleString()}
      </div>
      <div className="text-sm text-gray-500">{title}</div>
      {changeLabel && change !== undefined && (
        <div className="text-xs text-gray-400 mt-1">
          vs {change.toLocaleString()} {changeLabel}
        </div>
      )}
    </div>
  );
}

export default function AdminHomePage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="p-4 pt-12 max-w-4xl mx-auto">
      <h1 className="text-lg font-semibold mb-6">Summary</h1>

      {/* This week's activity */}
      <div className="mb-8">
        <h2 className="text-sm font-medium text-gray-500 mb-3">This week</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Active users"
            value={stats?.wau ?? 0}
            change={stats?.wauChange}
            changeLabel="last week"
            icon={Users}
            loading={isLoading}
          />
          <StatCard
            title="Sign ups"
            value={stats?.signupsThisWeek ?? 0}
            change={stats?.signupsLastWeek}
            changeLabel="last week"
            icon={TrendingUp}
            loading={isLoading}
          />
          <StatCard
            title="Reviews"
            value={stats?.reviewsThisWeek ?? 0}
            change={stats?.reviewsLastWeek}
            changeLabel="last week"
            icon={BookOpen}
            loading={isLoading}
          />
          <StatCard
            title="Words added"
            value={stats?.customWordsThisWeek ?? 0}
            change={stats?.customWordsLastWeek}
            changeLabel="last week"
            icon={PenLine}
            loading={isLoading}
          />
        </div>
      </div>

      {/* All time totals */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 mb-3">All time</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border rounded-2xl p-5">
            <div className="text-2xl font-semibold text-gray-900">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalUsers.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total users</div>
          </div>
          <div className="bg-white border rounded-2xl p-5">
            <div className="text-2xl font-semibold text-gray-900">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalReviews.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total reviews</div>
          </div>
          <div className="bg-white border rounded-2xl p-5">
            <div className="text-2xl font-semibold text-gray-900">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.totalCustomWords.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Custom words</div>
          </div>
        </div>
      </div>
    </div>
  );
}
