import type { ItemSize } from "./types";
import { useI18n } from "@/lib/i18n";

export default function SizeSelector({ sizes, selectedSizeId, onSelect }: { sizes: ItemSize[]; selectedSizeId: ItemSize["id"]; onSelect: (size: ItemSize) => void }) {
  const { t } = useI18n();
  return (
    <section className="size-section" aria-label={t("chooseBurgerSize")}>
      <div className="size-options" role="group" aria-label={t("burgerSize")}>
        {sizes.map((size) => (
          <button key={size.id} type="button" className={`size-option${selectedSizeId === size.id ? " is-selected" : ""}`} onClick={() => onSelect(size)} aria-pressed={selectedSizeId === size.id}>
            <span className="size-label font-semibold">{t(size.id === "small" ? "sizeSmall" : size.id === "large" ? "sizeLarge" : "sizeMedium")}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
