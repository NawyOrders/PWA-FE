import { useState } from "react";
import ItemIcon from "./ItemIcon";

type AddToCartButtonProps = {
  total: number;
  onAdd: () => void;
};

export default function AddToCartButton({ total, onAdd }: AddToCartButtonProps) {
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
        <span className="cart-button-label" aria-live="polite">{wasAdded ? "تمت الإضافة للسلة" : "أضف إلى السلة"}</span>
        <span className="cart-button-price">{total} <small>ج.م</small></span>
      </button>
    </div>
  );
}
