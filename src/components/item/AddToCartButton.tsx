import { useState } from "react";
import ItemIcon from "./ItemIcon";
import { useI18n } from "@/lib/i18n";

type AddToCartButtonProps = {
  total: number;
  onAdd: () => void;
};

export default function AddToCartButton({ total, onAdd }: AddToCartButtonProps) {
  const { t } = useI18n();
  const [wasAdded, setWasAdded] = useState(false);

  function handleAdd() {
    onAdd();
    setWasAdded(true);
    window.setTimeout(() => setWasAdded(false), 1800);
  }

  return (
    <div className="cart-bar">
      <button className={`add-to-cart-button${wasAdded ? " was-added" : ""}`} type="button" onClick={handleAdd}>
        <span className="cart-button-icon"><ItemIcon name={wasAdded ? "heart" : "plus"} size={25} /></span>
        <span className="cart-button-label" aria-live="polite">{wasAdded ? t("addedToCart") : t("addToCart")}</span>
        <span className="cart-button-price">{total} <small>{t("currency")}</small></span>
      </button>
    </div>
  );
}
