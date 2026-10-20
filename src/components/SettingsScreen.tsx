import type { ReactNode } from "react";
import { CircleIconButton } from "@/components/CircleIconButton";
import { ArrowEndIcon } from "@/components/icons";
import "./SettingsScreen.css";

interface SettingsScreenProps {
  title: string;
  subtitle: string;
  backLabel: string;
  onBack: () => void;
  cta?: ReactNode;
  children: ReactNode;
}

export function SettingsScreen({
  title,
  subtitle,
  backLabel,
  onBack,
  cta,
  children,
}: SettingsScreenProps) {
  return (
    <main className="relative min-h-dvh w-full bg-bg">
      <div aria-hidden className="ss-bg" />
      <div className="ss-column">
        <CircleIconButton
          label={backLabel}
          variant="white"
          onClick={onBack}
          className="!h-[44px] !w-[44px]"
        >
          <ArrowEndIcon className="h-[20px] w-[20px] rotate-180 rtl:rotate-0" />
        </CircleIconButton>

        <h1 className="mt-[24px] text-[40px] font-extrabold leading-[1.3] text-title">{title}</h1>
        <p className="mt-[12px] text-[16px] leading-[1.6] text-muted">{subtitle}</p>

        {children}

        {cta ? <div className="ss-cta">{cta}</div> : null}
      </div>
    </main>
  );
}
