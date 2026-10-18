"use client";

import { useSyncExternalStore } from "react";

const ORDER_CONFIRMED_KEY = "nawy-order-confirmed";
const ORDER_CONFIRMED_EVENT = "nawy-order-confirmed-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(ORDER_CONFIRMED_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(ORDER_CONFIRMED_EVENT, callback);
  };
}

function getSnapshot() {
  return window.sessionStorage.getItem(ORDER_CONFIRMED_KEY) === "true";
}

function getServerSnapshot() {
  return false;
}

export function useOrderConfirmed() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function markOrderConfirmed() {
  window.sessionStorage.setItem(ORDER_CONFIRMED_KEY, "true");
  window.dispatchEvent(new Event(ORDER_CONFIRMED_EVENT));
}
