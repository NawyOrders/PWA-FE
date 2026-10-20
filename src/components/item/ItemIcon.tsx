import type { ReactNode } from "react";

type ItemIconName = "close" | "heart" | "plus" | "minus";

const paths: Record<ItemIconName, ReactNode> = {
  close: <path d="m6 6 12 12M18 6 6 18" />,
  heart: <path d="M20.8 8.8c0 4.1-6.8 9-8.8 10.3C10 17.8 3.2 12.9 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
};

export default function ItemIcon({ name, size = 24 }: { name: ItemIconName; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 29 26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}
