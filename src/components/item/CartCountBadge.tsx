"use client";

import { useEffect, useState } from "react";
import { getCartCount } from "./cart-store";

export default function CartCountBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => setCount(getCartCount());
    updateCount();
    window.addEventListener("nawyorders:cart-updated", updateCount);
    return () => window.removeEventListener("nawyorders:cart-updated", updateCount);
  }, []);

  return <span className="menu-cart-count" aria-label={`عدد القطع في السلة: ${count}`}>{count}</span>;
}
