import { useState, type MouseEvent } from "react";
import ItemIcon from "./ItemIcon";
import { useI18n } from "@/lib/i18n";

type AddToCartButtonProps = {
  total: number;
  onAdd: () => void;
  label?: string;
  disabled?: boolean;
};

export default function AddToCartButton({ total, onAdd, label, disabled = false }: AddToCartButtonProps) {
  const { t } = useI18n();
  const [wasAdded, setWasAdded] = useState(false);

  function handleAdd(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    onAdd();
    if (!label) {
      setWasAdded(true);
      window.setTimeout(() => setWasAdded(false), 1800);
    }
  }

  return (
    <div className="cart-bar">
      <button className={`add-to-cart-button${wasAdded ? " was-added" : ""}`} type="button" onClick={handleAdd} disabled={disabled}>
        <span className="cart-button-icon"><ItemIcon name={wasAdded ? "heart" : "plus"} size={25} /></span>
        <span className="cart-button-label" aria-live="polite">{label ?? (wasAdded ? t("addedToCart") : t("addToCart"))}</span>
        <span className="cart-button-price">{total} <small>{t("currency")}</small></span>
      </button>
    </div>
  );
}
