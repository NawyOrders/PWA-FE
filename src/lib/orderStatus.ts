"use client";

import { useSyncExternalStore } from "react";

const ORDER_CONFIRMED_KEY = "nawy-order-confirmed";
const ORDER_CONFIRMED_EVENT = "nawy-order-confirmed-change";
const ORDER_TRACKING_DURATION = 15_000;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(ORDER_CONFIRMED_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ORDER_CONFIRMED_EVENT, callback);
  };
}

function getSnapshot() {
  const confirmedAt = Number(window.sessionStorage.getItem(ORDER_CONFIRMED_KEY));
  const elapsed = Date.now() - confirmedAt;
  return Number.isFinite(confirmedAt) && confirmedAt > 0 && elapsed >= 0 && elapsed < ORDER_TRACKING_DURATION;
}

function getServerSnapshot() {
  return false;
}

export function useOrderConfirmed() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function markOrderConfirmed() {
  const confirmedAt = Date.now();
  window.sessionStorage.setItem(ORDER_CONFIRMED_KEY, String(confirmedAt));
  window.dispatchEvent(new Event(ORDER_CONFIRMED_EVENT));
  window.setTimeout(() => {
    window.dispatchEvent(new Event(ORDER_CONFIRMED_EVENT));
  }, ORDER_TRACKING_DURATION);
}
