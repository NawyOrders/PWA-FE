"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useUiStore } from "@/store/uiStore";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ListRow } from "@/components/ListRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Modal } from "@/components/Modal";
import {
  BellIcon,
  CardIcon,
  CartIcon,
  EditIcon,
  HeartIcon,
  HelpIcon,
  InfoIcon,
  LocationIcon,
  LogoutIcon,
  StarIcon,
  UserIcon,
} from "@/components/icons";

export default function ProfilePage() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const logout = useAuthStore((state) => state.logout);
  const favoritesCount = useFavoritesStore((state) => state.ids.length);
  const ordersCount = useOrdersStore((state) => state.orders.length);
  const showToast = useUiStore((state) => state.showToast);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const rows: Array<{
    key: string;
    icon: ReactNode;
    tint: string;
    title: string;
    href?: string;
  }> = [
    { key: "personalInfo", icon: <EditIcon className="h-5 w-5 text-primary" />, tint: "bg-primary-tint", title: dict.profile.personalInfo, href: `/${locale}/profile/personal-info` },
    { key: "account", icon: <UserIcon className="h-5 w-5 text-primary" />, tint: "bg-primary-tint", title: dict.profile.account },
    { key: "addresses", icon: <LocationIcon className="h-5 w-5 text-accent" />, tint: "bg-glow", title: dict.profile.addresses, href: `/${locale}/profile/addresses` },
    { key: "payment", icon: <CardIcon className="h-5 w-5 text-success" />, tint: "bg-success-bg", title: dict.profile.payment },
    { key: "notifications", icon: <BellIcon className="h-5 w-5 text-primary" />, tint: "bg-primary-tint", title: dict.profile.notifications },
    { key: "about", icon: <InfoIcon className="h-5 w-5 text-accent" />, tint: "bg-glow", title: dict.profile.about },
    { key: "help", icon: <HelpIcon className="h-5 w-5 text-success" />, tint: "bg-success-bg", title: dict.profile.help },
  ];

  const handleLogout = () => {
    logout();
    setConfirmOpen(false);
    showToast(dict.toast.loggedOut);
    router.replace(`/${locale}`);
  };

  if (!isLoggedIn || !user) {
    return (
      <main className="min-h-dvh w-full">
        <div className="container-x">
          <div className="mx-auto w-full max-w-[40rem]">
          <ScreenHeader
            kicker={dict.profile.kicker}
            title={dict.profile.title}
            action="back"
            onAction={() => router.back()}
            actionLabel={dict.common.back}
          />
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-glow text-primary">
              <UserIcon className="h-10 w-10" />
            </div>
            <h2 className="text-[1.125rem] font-extrabold text-title">{dict.profile.guestTitle}</h2>
            <p className="max-w-[16.25rem] text-[0.875rem] text-muted">{dict.profile.guestHint}</p>
            <div className="w-full max-w-[13.75rem]">
              <PrimaryButton onClick={() => router.push(`/${locale}/login`)}>
                {dict.profile.login}
              </PrimaryButton>
            </div>
          </div>
          </div>
        </div>
      </main>
    );
  }

  const stats = [
    { key: "favorites", value: favoritesCount, label: dict.profile.favorites, icon: <HeartIcon className="h-5 w-5 text-primary" filled />, tint: "bg-primary-tint" },
    { key: "orders", value: ordersCount, label: dict.profile.orders, icon: <CartIcon className="h-5 w-5 text-accent" />, tint: "bg-glow" },
    { key: "points", value: user.points, label: dict.profile.points, icon: <StarIcon className="h-5 w-5 text-success" filled />, tint: "bg-success-bg" },
  ];

  return (
    <main className="min-h-dvh w-full pb-10">
      <div className="container-x">
        <div className="mx-auto w-full max-w-[40rem]">
      <ScreenHeader
        kicker={dict.profile.kicker}
        title={dict.profile.title}
        action="back"
        onAction={() => router.back()}
        actionLabel={dict.common.back}
      />

      <div className="flex flex-col items-center pt-6 text-center">
        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute -start-8 -top-3 h-20 w-20 rounded-full bg-brand-gold-soft blur-2xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-3 -end-8 h-20 w-20 rounded-full bg-primary-soft blur-2xl"
          />
          <div className="relative z-10 flex h-[8.75rem] w-[8.75rem] items-center justify-center rounded-full bg-primary-tint text-[3rem] font-extrabold text-primary ring-[6px] ring-primary">
            {user.name.trim().charAt(0)}
          </div>
          <button
            type="button"
            aria-label={dict.profile.editAvatar}
            onClick={() => showToast(dict.profile.comingSoon)}
            className="absolute bottom-1 end-1 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-primary-gradient text-white shadow-cta transition-transform active:scale-90"
          >
            <EditIcon className="h-4 w-4" />
          </button>
        </div>

        <h1 className="mt-4 text-[1.75rem] font-extrabold text-title">{user.name}</h1>
        <p dir="ltr" className="font-latin text-[0.875rem] text-muted">
          {user.email}
        </p>

        <div className="mt-6 grid w-full grid-cols-3 rounded-card bg-glow p-4">
          {stats.map((stat, index) => (
            <div
              key={stat.key}
              className={`flex flex-col items-center gap-1 px-2${index > 0 ? " border-s border-line" : ""}`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.tint}`}>
                {stat.icon}
              </span>
              <span className="text-[1.125rem] font-extrabold text-title">{stat.value}</span>
              <span className="text-[0.75rem] text-muted">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {rows.map((row) => (
          <ListRow
            key={row.key}
            icon={row.icon}
            iconClassName={row.tint}
            title={row.title}
            onClick={() =>
              row.href ? router.push(row.href) : showToast(dict.profile.comingSoon)
            }
          />
        ))}
      </div>

      <div className="pt-6">
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="flex h-[3.375rem] w-full items-center justify-center gap-2 rounded-full bg-danger-bg text-[1rem] font-bold text-danger transition-transform active:scale-[0.98]"
        >
          <LogoutIcon className="h-5 w-5" />
          {dict.profile.logout}
        </button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} labelledBy="logout-title">
        <h2 id="logout-title" className="text-[1.25rem] font-extrabold text-title">
          {dict.profile.logoutTitle}
        </h2>
        <p className="mt-2 text-[0.875rem] text-muted">{dict.profile.logoutBody}</p>
        <div className="mt-5 space-y-3">
          <PrimaryButton onClick={handleLogout}>{dict.profile.logout}</PrimaryButton>
          <PrimaryButton variant="outline" onClick={() => setConfirmOpen(false)}>
            {dict.common.cancel}
          </PrimaryButton>
        </div>
      </Modal>
      </div>
      </div>
    </main>
  );
}
