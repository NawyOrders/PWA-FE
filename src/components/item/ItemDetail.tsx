"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUiStore } from "@/store/uiStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { burgerItem, itemAddons, itemSizes } from "./data";
import type { Dish } from "@/data/dishes";
import { dishImage } from "@/lib/image";
import AddToCartButton from "./AddToCartButton";
import BurgerArtwork from "./BurgerArtwork";
import CustomizationPicker from "./CustomizationPicker";
import ItemHeader from "./ItemHeader";
import NotesField from "./NotesField";
import QuantitySelector from "./QuantitySelector";
import SizeSelector from "./SizeSelector";
import { LoginRequiredModal } from "@/components/LoginRequiredModal";
import type { ItemSize } from "./types";
import { getDictionary, useI18n } from "@/lib/i18n";

export default function ItemDetail({ dish }: { dish?: Dish }) {
  const { locale, t, href } = useI18n();
  const toastMessages = getDictionary(locale).toast;
  const router = useRouter();
  const addCartItems = useCartStore((state) => state.add);
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const showToast = useUiStore((state) => state.showToast);
  const loginModalOpen = useUiStore((state) => state.loginModalOpen);
  const guard = useAuthGuard();
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState<ItemSize["id"]>("medium");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const itemId = dish?.id ?? burgerItem.id;
  const isFavorite = favoriteIds.includes(itemId);
  const itemName = dish?.name[locale] ?? t("itemName");
  const itemDescription = dish?.description[locale] ?? t("itemDescription");
  const imageSrc = dish ? dishImage(dish.image, "large") : "/burger.png";
  const sizes = dish
    ? itemSizes.map((size) => ({ ...size, price: Math.round(dish.sizePrices[size.id] / 100) }))
    : itemSizes;
  const selectedSize = sizes.find((size) => size.id === selectedSizeId) ?? sizes[1];

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
    addCartItems(itemId, quantity, Math.round(unitPrice * 100));
  }

  function handleToggleFavorite() {
    guard(() => {
      const wasFavorite = favoriteIds.includes(itemId);
      toggleFavorite(itemId);
      showToast(wasFavorite ? toastMessages.favoriteRemoved : toastMessages.favoriteAdded);
    });
  }

  function closePage() {
    if (window.history.length > 1) router.back();
    else router.push(href("/"));
  }

  return (
    <>
      <main className="item-page">
        <div className="item-page-inner">
          <ItemHeader isFavorite={isFavorite} onClose={closePage} onToggleFavorite={handleToggleFavorite} />

          <section className="item-intro" aria-labelledby="item-name">
            <h1 id="item-name">{itemName}</h1>
            <p className="item-description-glass max-w-3/4">{itemDescription}</p>
          </section>

          <section className="product-stage relative" aria-label={t("itemImageQuantity")}>
            <BurgerArtwork src={imageSrc} alt={itemName} />
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
          </section>

          <SizeSelector sizes={sizes} selectedSizeId={selectedSize.id} onSelect={(size) => setSelectedSizeId(size.id)} />
          <CustomizationPicker addons={itemAddons} selectedAddonIds={selectedAddonIds} onToggle={toggleAddon} />
          <NotesField value={note} onChange={setNote} />
          <div className="item-bottom-space" />
        </div>

        <AddToCartButton total={total} onAdd={addToCart} />
      </main>
      {loginModalOpen ? <LoginRequiredModal /> : null}
    </>
  );
}
