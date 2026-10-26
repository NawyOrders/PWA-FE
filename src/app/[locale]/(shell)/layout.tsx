"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { useUiStore } from "@/store/uiStore";
import { DesktopNav } from "@/components/DesktopNav";
import { Drawer } from "@/components/Drawer";
import { Toast } from "@/components/Toast";
import { CartSummaryBar } from "@/components/CartSummaryBar/CartSummaryBar";
import { OrderTrackingCard } from "@/components/OrderTrackingCard/OrderTrackingCard";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import { InstallBanner } from "@/components/pwa/InstallBanner";
import { UpdateToast } from "@/components/pwa/UpdateToast";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";

const DrawerContent = dynamic(
  () => import("@/components/DrawerContent").then((mod) => mod.DrawerContent),
  { ssr: false },
);
const LoginRequiredModal = dynamic(
  () => import("@/components/LoginRequiredModal").then((mod) => mod.LoginRequiredModal),
  { ssr: false },
);

export default function ShellLayout({ children }: { children: ReactNode }) {
  const drawerOpen = useUiStore((state) => state.drawerOpen);
  const closeDrawer = useUiStore((state) => state.closeDrawer);
  const loginModalOpen = useUiStore((state) => state.loginModalOpen);

  return (
    <div className="relative flex min-h-dvh w-full flex-col bg-bg">
      <PwaProvider />
      <OfflineBanner />
      <DesktopNav />
      <div className="flex-1">{children}</div>
      <CartSummaryBar />
      <OrderTrackingCard />
      {drawerOpen ? (
        <Drawer open onClose={closeDrawer} labelledBy="drawer-title">
          <DrawerContent />
        </Drawer>
      ) : null}
      {loginModalOpen ? <LoginRequiredModal /> : null}
      <InstallBanner />
      <UpdateToast />
      <Toast />
    </div>
  );
}
