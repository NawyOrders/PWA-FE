"use client";

import { useEffect, useState } from "react";
import { getCartCount } from "./cart-store";
import { useI18n } from "@/lib/i18n";

export default function CartCountBadge() {
  const { t } = useI18n();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const updateCount = () => setCount(getCartCount());
    updateCount();
    window.addEventListener("nawyorders:cart-updated", updateCount);
    return () => window.removeEventListener("nawyorders:cart-updated", updateCount);
  }, []);

  return <span className="menu-cart-count" aria-label={`${t("cartCountAria")}: ${count}`}>{count}</span>;
}
