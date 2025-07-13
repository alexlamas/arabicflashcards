export function isClientSide(): boolean {
  return typeof window !== "undefined";
}

export function getOnlineStatus(): boolean {
  if (!isClientSide()) {
    // Default to online during SSR
    return true;
  }
  return navigator.onLine;
}

export function isBrowser(): boolean {
  return isClientSide() && typeof navigator !== "undefined";
}