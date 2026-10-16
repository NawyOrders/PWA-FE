import type { OrderStatus } from "@/data/orders";

interface StatusBadgeProps {
  status: OrderStatus;
  label: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const tone =
    status === "delivered"
      ? "bg-success-bg text-success"
      : status === "cancelled"
        ? "bg-danger-bg text-danger"
        : "bg-primary-tint text-primary";

  return (
    <span
      className={`inline-flex h-7 items-center rounded-full px-3 text-[0.8125rem] font-bold ${tone}`}
    >
      {label}
    </span>
  );
}
