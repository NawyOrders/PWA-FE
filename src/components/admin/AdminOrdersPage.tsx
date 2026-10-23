"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useI18n as useDictionaryI18n } from "@/lib/i18n/DictionaryProvider";
import { useOrdersStore } from "@/store/ordersStore";
import { useUiStore } from "@/store/uiStore";
import { formatPrice } from "@/lib/format";
import type { OrderStatus } from "@/data/orders";
import { PrintSlipButton } from "@/components/admin/PrintSlipButton";

const statusKeys: Record<OrderStatus, "accepted" | "delivered" | "cancelled" | "processing"> = {
  accepted: "accepted",
  delivered: "delivered",
  cancelled: "cancelled",
  processing: "processing",
};

export function AdminOrdersPage() {
  const { t, href } = useI18n();
  const { dict, locale } = useDictionaryI18n();
  const hydrated = useUiStore((state) => state.hydrated);
  const orders = useOrdersStore((state) => state.orders);

  return (
    <main className="admin-orders-page">
      <div className="admin-orders-shell">
        <header className="admin-orders-header">
          <Link href={href("/")} className="admin-orders-back">
            {dict.common.back}
          </Link>
          <div>
            <h1>{t("adminOrdersTitle")}</h1>
            <p>{t("adminOrdersSubtitle")}</p>
          </div>
        </header>

        {!hydrated ? (
          <p className="admin-orders-empty">{t("mapLoading")}</p>
        ) : orders.length === 0 ? (
          <p className="admin-orders-empty">{t("printNoOrders")}</p>
        ) : (
          <div className="admin-orders-list">
            {orders.map((order) => {
              const total =
                order.items.reduce((sum, item) => {
                  const unitPrice = item.unitPrice ?? 0;
                  return sum + unitPrice * item.quantity;
                }, 0) +
                order.deliveryFee -
                (order.discount ?? 0) +
                (order.tax ?? 0);
              return (
                <article className="admin-order-card" key={order.id}>
                  <div className="admin-order-head">
                    <div>
                      <h2>#{order.number}</h2>
                      <p>{new Date(order.date).toLocaleString(locale)}</p>
                    </div>
                    <span className={`admin-order-status status-${order.status}`}>
                      {dict.orders[statusKeys[order.status]]}
                    </span>
                  </div>
                  <dl className="admin-order-meta">
                    <div>
                      <dt>{t("receiptBranch")}</dt>
                      <dd>{order.branchName?.[locale] ?? t("branchName")}</dd>
                    </div>
                    <div>
                      <dt>{t("receiptFulfillment")}</dt>
                      <dd>{order.fulfillmentMethod === "pickup" ? t("receiptPickup") : t("receiptDelivery")}</dd>
                    </div>
                    <div>
                      <dt>{t("orderItemsCount")}</dt>
                      <dd>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
                    </div>
                    <div>
                      <dt>{t("total")}</dt>
                      <dd>{formatPrice(total, locale)}</dd>
                    </div>
                  </dl>
                  {order.address ? <p className="admin-order-address">{order.address}</p> : null}
                  <PrintSlipButton order={order} />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
