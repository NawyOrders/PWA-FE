import type { CSSProperties } from "react";
import type { ItemAddon } from "./types";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";

export default function CustomizationPicker({ addons, selectedAddonIds, onToggle }: { addons: ItemAddon[]; selectedAddonIds: string[]; onToggle: (addonId: string) => void }) {
  const { t } = useI18n();
  return (
    <section className="item-section" aria-labelledby="customization-heading">
      <div className="section-heading-row">
        <h2 id="customization-heading">{t("customize")}</h2>
      </div>
      <div className="addon-list">
        {addons.map((addon) => {
          const selected = selectedAddonIds.includes(addon.id);
          return (
            <button key={addon.id} className={`addon-option${selected ? " is-selected" : ""}`} type="button" onClick={() => onToggle(addon.id)} aria-pressed={selected} aria-label={`${selected ? t("remove") : t("add")} ${t(`addon${addon.id[0].toUpperCase()}${addon.id.slice(1)}` as "addonLettuce")}`}>
              <Image src={addon.image} alt="" width={24} height={24} className="addon-art" style={{ "--addon-color": addon.color } as CSSProperties} aria-hidden="true" />
              <span className="addon-check" aria-hidden="true">{selected ? "✓" : "+"}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
