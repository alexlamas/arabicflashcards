"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { SyncService } from "../services/syncService";
import { OfflineStorage } from "../services/offlineStorage";
import { OFFLINE_CONSTANTS } from "../types/offline";
import { getOnlineStatus } from "../utils/connectivity";

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const updateStatus = useCallback(() => {
    const online = getOnlineStatus();
    const actions = OfflineStorage.getPendingActions();
    
    setIsOnline(online);
    setPendingCount(actions.length);
  }, []);

  useEffect(() => {
    // Set initial status on client
    updateStatus();

    // Event listeners
    const handleOnline = () => {
      setIsOnline(true);
      updateStatus();
    };

    const handleOffline = () => {
      setIsOnline(false);
      updateStatus();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sync listener
    const unsubscribeSyncListener = SyncService.addSyncListener(setIsSyncing);

    // Periodic update for pending count
    const interval = setInterval(updateStatus, OFFLINE_CONSTANTS.SYNC_CHECK_INTERVAL);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      unsubscribeSyncListener();
      clearInterval(interval);
    };
  }, [updateStatus]);

  // Don't show indicator when online with no pending actions and not syncing
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return "bg-red-500";
    if (isSyncing) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStatusIcon = () => {
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }
    return isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isSyncing) return "Syncing...";
    return isOnline ? "Online" : "Offline";
  };

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all ${getStatusColor()} text-white`}
      role="status"
      aria-live="polite"
      aria-label={`Connection status: ${getStatusText()}`}
    >
      {getStatusIcon()}
      <span>{getStatusText()}</span>
      {pendingCount > 0 && (
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
          {pendingCount} pending
        </span>
      )}
    </div>
  );
}