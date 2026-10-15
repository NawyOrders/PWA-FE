import ItemIcon from "./ItemIcon";

export default function QuantitySelector({ quantity, onChange }: { quantity: number; onChange: (quantity: number) => void }) {
  return (
    <div className="quantity-control" dir="ltr" aria-label="الكمية">
      <button type="button" onClick={() => onChange(quantity + 1)} aria-label="زيادة الكمية"><ItemIcon name="plus" size={22} /></button>
      <output aria-live="polite" aria-atomic="true">{quantity}</output>
      <button type="button" onClick={() => onChange(Math.max(1, quantity - 1))} aria-label="تقليل الكمية" disabled={quantity === 1}><ItemIcon name="minus" size={22} /></button>
    </div>
  );
}
