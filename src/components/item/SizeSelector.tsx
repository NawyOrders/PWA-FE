import type { ItemSize } from "./types";

export default function SizeSelector({ sizes, selectedSizeId, onSelect }: { sizes: ItemSize[]; selectedSizeId: ItemSize["id"]; onSelect: (size: ItemSize) => void }) {
  return (
    <section className="size-section" aria-label="اختر حجم البرجر">
      <div className="size-options" role="group" aria-label="حجم البرجر">
        {sizes.map((size) => (
          <button key={size.id} type="button" className={`size-option${selectedSizeId === size.id ? " is-selected" : ""}`} onClick={() => onSelect(size)} aria-pressed={selectedSizeId === size.id}>
            <span className="size-label font-semibold">{size.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
