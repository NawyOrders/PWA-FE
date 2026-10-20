"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { demoUser } from "@/data/user";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextInput } from "@/components/TextInput";
import { PhoneInput } from "@/components/PhoneInput";
import { OtpInput } from "@/components/OtpInput";
import { CircleIconButton } from "@/components/CircleIconButton";
import { CloseIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

const DEMO_OTP = "747123";

export default function LoginPage() {
  const { locale, dict, t } = useI18n();
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const showToast = useUiStore((state) => state.showToast);

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [remember, setRemember] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [otpError, setOtpError] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const sendCode = () => {
    if (!/^\d{10}$/.test(phone)) {
      setPhoneError(dict.auth.invalidPhone);
      return;
    }
    setPhoneError("");
    setStep("otp");
    setOtp("");
    setOtpError(false);
    setSecondsLeft(60);
  };

  const submit = () => {
    let invalid = false;
    if (!name.trim()) {
      setNameError(dict.auth.invalidName);
      invalid = true;
    }
    if (otp !== DEMO_OTP) {
      setOtpError(true);
      invalid = true;
    } else {
      setOtpError(false);
    }
    if (invalid) return;

    login({ ...demoUser, name: name.trim(), phone: `0${phone}` }, remember);
    showToast(dict.toast.welcome, "success");
    router.replace(`/${locale}`);
  };

  return (
    <main className="min-h-dvh bg-bg-splash pb-10 pt-6">
      <div className="container-x">
        <div className="mx-auto w-full max-w-app md:max-w-[35rem] md:pt-10">
        <div className="flex justify-start">
          <CircleIconButton
            label={dict.common.close}
            variant="muted"
            onClick={() => router.replace(`/${locale}`)}
          >
            <CloseIcon className="h-5 w-5" />
          </CircleIconButton>
        </div>

        <div className="mt-6 flex flex-col items-center text-center">
          <h1 className="text-[1.375rem] font-extrabold text-title">{dict.auth.welcome}</h1>
          <p className="mt-1 max-w-[18.75rem] text-[0.875rem] text-muted">{dict.auth.subtitle}</p>
        </div>

        <div className="mt-8 space-y-4 rounded-card bg-surface p-4 shadow-card">
          <TextInput
            label={dict.auth.fullName}
            value={name}
            onChange={(value) => {
              setName(value);
              if (nameError) setNameError("");
            }}
            placeholder={dict.auth.fullNamePlaceholder}
            helper={dict.auth.fullNameHelper}
            error={nameError}
          />

          <div>
            <label className="mb-2 block text-[0.875rem] font-bold text-title">
              {dict.auth.phoneLabel}
              <span className="text-danger"> *</span>
            </label>
            <PhoneInput
              value={phone}
              onChange={(value) => {
                setPhone(value);
                if (phoneError) setPhoneError("");
              }}
              onSend={sendCode}
              sendLabel={dict.auth.send}
              ariaLabel={dict.auth.phoneLabel}
              placeholder={dict.auth.phonePlaceholder}
              error={phoneError}
              countdown={secondsLeft > 0 ? secondsLeft : null}
              countdownLabel={t(dict.auth.seconds, { seconds: secondsLeft })}
            />
            {step === "otp" && secondsLeft === 0 ? (
              <button
                type="button"
                onClick={sendCode}
                className="mt-2 text-[0.8125rem] font-bold text-primary"
              >
                {dict.auth.resend}
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            <label className="block text-center text-[0.875rem] font-bold text-title">
              {dict.auth.otpLabel}
            </label>
            <OtpInput
              value={otp}
              onChange={(value) => {
                setOtp(value);
                if (otpError) setOtpError(false);
              }}
              error={otpError}
              ariaLabel={dict.auth.otpLabel}
              disabled={step !== "otp"}
            />
            <p
              className={cn(
                "text-center text-[0.75rem]",
                otpError ? "font-bold text-danger" : "text-muted",
              )}
              aria-live="polite"
            >
              {otpError ? dict.auth.invalidOtp : dict.auth.otpHelper}
            </p>
            <p className="text-center text-[0.75rem] font-medium text-accent">{dict.auth.demo}</p>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-[0.875rem] font-bold text-title">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            {dict.auth.remember}
          </label>

          <PrimaryButton onClick={submit}>{dict.auth.login}</PrimaryButton>
        </div>
        </div>
      </div>
    </main>
  );
}
