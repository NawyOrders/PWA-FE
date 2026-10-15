"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addCartItem } from "./cart-store";
import { burgerItem, itemAddons, itemSizes } from "./data";
import AddToCartButton from "./AddToCartButton";
import BurgerArtwork from "./BurgerArtwork";
import CustomizationPicker from "./CustomizationPicker";
import ItemHeader from "./ItemHeader";
import NotesField from "./NotesField";
import QuantitySelector from "./QuantitySelector";
import SizeSelector from "./SizeSelector";
import type { ItemSize } from "./types";
import { useI18n } from "@/lib/i18n";

export default function ItemDetail() {
  const { t, href } = useI18n();
  const router = useRouter();
  const [quantity, setQuantity] = useState(2);
  const [selectedSize, setSelectedSize] = useState<ItemSize>(itemSizes[1]);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [cartCount, setCartCount] = useState<number | null>(null);

  const selectedAddons = useMemo(
    () => itemAddons.filter((addon) => selectedAddonIds.includes(addon.id)),
    [selectedAddonIds],
  );
  const unitPrice = selectedSize.price + selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
  const total = unitPrice * quantity;

  function toggleAddon(addonId: string) {
    setSelectedAddonIds((current) => current.includes(addonId)
      ? current.filter((id) => id !== addonId)
      : [...current, addonId]);
  }

  function addToCart() {
    const count = addCartItem({
      id: burgerItem.id,
      name: t("itemName"),
      sizeId: selectedSize.id,
      sizeLabel: t(selectedSize.id === "small" ? "sizeSmall" : selectedSize.id === "large" ? "sizeLarge" : "sizeMedium"),
      unitPrice,
      quantity,
      addonIds: selectedAddons.map((addon) => addon.id),
      note: note.trim(),
    });
    setCartCount(count);
  }

  function closePage() {
    if (window.history.length > 1) router.back();
    else router.push(href("/"));
  }

  return (
    <main className="item-page">
      <div className="item-page-inner">
        <ItemHeader isFavorite={isFavorite} onClose={closePage} onToggleFavorite={() => setIsFavorite((value) => !value)} />

        <section className="item-intro" aria-labelledby="item-name">
          <h1 id="item-name">{t("itemName")}</h1>
          <p className="item-description-glass max-w-3/4">{t("itemDescription")}</p>
        </section>

        <section className="product-stage relative" aria-label={t("itemImageQuantity")}>
          <BurgerArtwork />
          <QuantitySelector quantity={quantity} onChange={setQuantity} />
        </section>

        <SizeSelector sizes={itemSizes} selectedSizeId={selectedSize.id} onSelect={setSelectedSize} />
        <CustomizationPicker addons={itemAddons} selectedAddonIds={selectedAddonIds} onToggle={toggleAddon} />
        <NotesField value={note} onChange={setNote} />
        <div className="item-bottom-space" />
      </div>

      {cartCount !== null && <p className="cart-status" role="status">{t("cartCount")} {cartCount} {t("pieces")}</p>}
      <AddToCartButton total={total} onAdd={addToCart} />
    </main>
  );
}
