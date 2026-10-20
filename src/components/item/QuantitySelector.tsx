import ItemIcon from "./ItemIcon";
import { useI18n } from "@/lib/i18n";

export default function QuantitySelector({ quantity, onChange }: { quantity: number; onChange: (quantity: number) => void }) {
  const { t } = useI18n();
  return (
    <div className="quantity-control" dir="ltr" aria-label={t("quantity")}>
      <button type="button" onClick={() => onChange(quantity + 1)} aria-label={t("increaseQuantity")}><ItemIcon name="plus" size={22} /></button>
      <output aria-live="polite" aria-atomic="true">{quantity}</output>
      <button type="button" onClick={() => onChange(Math.max(1, quantity - 1))} aria-label={t("decreaseQuantity")} disabled={quantity === 1}><ItemIcon name="minus" size={22} /></button>
    </div>
  );
}
