"use client";

// PLACEHOLDER UI — the address form is a proposal (DESIGN.md 12.5) and is
// clearly marked as pending the owner's real mockup. Bottom sheet on mobile,
// 480px modal on desktop and tablet.

import { useState, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { cn } from "@/lib/cn";
import { Modal } from "@/components/Modal";
import { PrimaryButton } from "@/components/PrimaryButton";
import { CircleIconButton } from "@/components/CircleIconButton";
import { CloseIcon } from "@/components/icons";
import type { Address, AddressType } from "@/store/addressStore";

interface AddressFormSheetProps {
  address: Address;
  mode: "add" | "edit";
  onClose: () => void;
  onSubmit: (address: Address) => void;
}

type FieldKey = "customLabel" | "area" | "street";

const TYPE_OPTIONS: AddressType[] = ["home", "work", "other"];

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error: boolean;
  errorText: string;
  placeholder?: string;
  autoComplete?: string;
  enterKeyHint?: "next" | "done";
}

function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  errorText,
  placeholder,
  autoComplete,
  enterKeyHint,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-[12px] block text-[14px] font-bold text-title">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-[56px] w-full rounded-[20px] bg-surface px-4 text-[16px] font-bold text-title outline-none transition-colors placeholder:font-normal placeholder:text-muted",
          error
            ? "border-2 border-danger"
            : "border-[1.5px] border-line focus:border-2 focus:border-primary",
        )}
        placeholder={placeholder}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
      />
      <p
        id={`${id}-error`}
        aria-live="polite"
        className={cn("text-[12px] font-medium text-danger", error && "mt-[8px]")}
      >
        {error ? errorText : null}
      </p>
    </div>
  );
}

export function AddressFormSheet({ address, mode, onClose, onSubmit }: AddressFormSheetProps) {
  const { dict } = useI18n();
  const [type, setType] = useState<AddressType>(address.type);
  const [customLabel, setCustomLabel] = useState(address.customLabel);
  const [area, setArea] = useState(address.area);
  const [street, setStreet] = useState(address.street);
  const [building, setBuilding] = useState(address.building);
  const [floorApartment, setFloorApartment] = useState(address.floorApartment);
  const [landmark, setLandmark] = useState(address.landmark);
  const [notes, setNotes] = useState(address.notes);
  const [isDefault, setIsDefault] = useState(address.isDefault);
  const [touched, setTouched] = useState<Record<FieldKey, boolean>>({
    customLabel: false,
    area: false,
    street: false,
  });

  const labelError = type === "other" && customLabel.trim() === "";
  const areaError = area.trim() === "";
  const streetError = street.trim() === "";
  const hasErrors = labelError || areaError || streetError;

  const markTouched = (key: FieldKey) => setTouched((prev) => ({ ...prev, [key]: true }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ customLabel: true, area: true, street: true });
    if (hasErrors) return;
    onSubmit({
      ...address,
      type,
      customLabel: type === "other" ? customLabel.trim() : "",
      area: area.trim(),
      street: street.trim(),
      building: building.trim(),
      floorApartment: floorApartment.trim(),
      landmark: landmark.trim(),
      notes: notes.trim(),
      isDefault,
    });
  };

  return (
    <Modal
      open
      onClose={onClose}
      labelledBy="address-form-title"
      bottomSheet
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex items-center justify-between gap-3">
          <h2 id="address-form-title" className="text-[1.25rem] font-extrabold text-title">
            {mode === "add" ? dict.addresses.formAddTitle : dict.addresses.formEditTitle}
          </h2>
          <CircleIconButton
            label={dict.common.close}
            variant="muted"
            onClick={onClose}
            className="!h-[44px] !w-[44px]"
          >
            <CloseIcon className="h-[20px] w-[20px]" />
          </CircleIconButton>
        </div>

        <div className="mt-[20px] space-y-[16px]">
          <fieldset>
            <legend className="mb-[12px] text-[14px] font-bold text-title">
              {dict.addresses.labelType}
            </legend>
            <div className="flex gap-[8px]">
              {TYPE_OPTIONS.map((option) => {
                const active = type === option;
                return (
                  <label
                    key={option}
                    className={cn(
                      "flex h-[44px] flex-1 cursor-pointer items-center justify-center rounded-[16px] border-[1.5px] text-[14px] font-bold",
                      "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
                      active
                        ? "border-primary bg-primary-tint text-primary"
                        : "border-line bg-surface text-muted",
                    )}
                  >
                    <input
                      type="radio"
                      name="address-type"
                      value={option}
                      checked={active}
                      onChange={() => setType(option)}
                      className="sr-only"
                    />
                    <span className="pointer-events-none">
                      {option === "home"
                        ? dict.addresses.home
                        : option === "work"
                          ? dict.addresses.work
                          : dict.addresses.other}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {type === "other" ? (
            <Field
              id="address-custom-label"
              label={dict.addresses.labelCustom}
              value={customLabel}
              onChange={(value) => {
                setCustomLabel(value);
                if (touched.customLabel) markTouched("customLabel");
              }}
              onBlur={() => markTouched("customLabel")}
              error={touched.customLabel && labelError}
              errorText={dict.addresses.errorCustomLabel}
              placeholder={dict.addresses.labelCustomPlaceholder}
              autoComplete="off"
              enterKeyHint="next"
            />
          ) : null}

          <Field
            id="address-area"
            label={dict.addresses.labelArea}
            value={area}
            onChange={(value) => {
              setArea(value);
              if (touched.area) markTouched("area");
            }}
            onBlur={() => markTouched("area")}
            error={touched.area && areaError}
            errorText={dict.addresses.errorArea}
            autoComplete="address-level2"
            enterKeyHint="next"
          />

          <Field
            id="address-street"
            label={dict.addresses.labelStreet}
            value={street}
            onChange={(value) => {
              setStreet(value);
              if (touched.street) markTouched("street");
            }}
            onBlur={() => markTouched("street")}
            error={touched.street && streetError}
            errorText={dict.addresses.errorStreet}
            autoComplete="address-line1"
            enterKeyHint="next"
          />

          <Field
            id="address-building"
            label={dict.addresses.labelBuilding}
            value={building}
            onChange={setBuilding}
            onBlur={() => undefined}
            error={false}
            errorText=""
            autoComplete="address-line2"
            enterKeyHint="next"
          />

          <Field
            id="address-floor"
            label={dict.addresses.labelFloorApartment}
            value={floorApartment}
            onChange={setFloorApartment}
            onBlur={() => undefined}
            error={false}
            errorText=""
            autoComplete="off"
            enterKeyHint="next"
          />

          <Field
            id="address-landmark"
            label={dict.addresses.labelLandmark}
            value={landmark}
            onChange={setLandmark}
            onBlur={() => undefined}
            error={false}
            errorText=""
            autoComplete="off"
            enterKeyHint="next"
          />

          <Field
            id="address-notes"
            label={dict.addresses.labelNotes}
            value={notes}
            onChange={setNotes}
            onBlur={() => undefined}
            error={false}
            errorText=""
            autoComplete="off"
            enterKeyHint="done"
          />

          <button
            type="button"
            role="switch"
            aria-checked={isDefault}
            onClick={() => setIsDefault((value) => !value)}
            className="flex h-[44px] w-full items-center justify-between gap-3"
          >
            <span className="text-[14px] font-bold text-title">{dict.addresses.setDefault}</span>
            <span aria-hidden className={cn("ad-switch", isDefault && "ad-switch--on")}>
              <span className="ad-switch__knob" />
            </span>
          </button>
        </div>

        <div className="mt-[24px]">
          <PrimaryButton type="submit" size="lg">
            {dict.addresses.formSave}
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
