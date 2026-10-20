"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCartItemKey, useCartStore, type CartItem as StoredCartItem } from "@/store/cartStore";
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
import { useI18n as useDictionaryI18n } from "@/lib/i18n/DictionaryProvider";

export default function ItemDetail({ dish }: { dish?: Dish }) {
  const { locale, t, href } = useI18n();
  const { dict } = useDictionaryI18n();
  const toastMessages = getDictionary(locale).toast;
  const router = useRouter();
  const searchParams = useSearchParams();
  const editKey = searchParams.get("edit");
  const cartItems = useCartStore((state) => state.items);
  const addCartItems = useCartStore((state) => state.add);
  const updateCartItem = useCartStore((state) => state.update);
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const showToast = useUiStore((state) => state.showToast);
  const loginModalOpen = useUiStore((state) => state.loginModalOpen);
  const hydrated = useUiStore((state) => state.hydrated);
  const guard = useAuthGuard();
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState<ItemSize["id"]>("medium");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [loadedEditKey, setLoadedEditKey] = useState<string | null>(null);
  const itemId = dish?.id ?? burgerItem.id;
  const editItem = editKey
    ? cartItems.find((item) => getCartItemKey(item) === editKey && item.dishId === itemId)
    : undefined;
  const isFavorite = favoriteIds.includes(itemId);
  const itemName = dish?.name[locale] ?? t("itemName");
  const itemDescription = dish?.description[locale] ?? t("itemDescription");
  const imageSrc = dish ? dishImage(dish.image, "large") : "/burger.png";
  const sizes = dish
    ? itemSizes.map((size) => ({ ...size, price: Math.round(dish.sizePrices[size.id] / 100) }))
    : itemSizes;
  const selectedSize = sizes.find((size) => size.id === selectedSizeId) ?? sizes[1];

  useEffect(() => {
    if (!editKey || !hydrated || loadedEditKey === editKey) return;
    if (!editItem) {
      router.replace(href("/cart"));
      return;
    }

    const addonPrice = (editItem.addonIds ?? []).reduce(
      (sum, addonId) => sum + (itemAddons.find((addon) => addon.id === addonId)?.price ?? 0),
      0,
    );
    const basePrice = editItem.unitPrice === undefined
      ? undefined
      : editItem.unitPrice - addonPrice * 100;
    const inferredSize = basePrice === undefined
      ? undefined
      : sizes.find((size) => Math.round(size.price * 100) === basePrice)?.id;

    setQuantity(editItem.quantity);
    setSelectedSizeId(editItem.sizeId ?? inferredSize ?? "medium");
    setSelectedAddonIds(editItem.addonIds ?? []);
    setNote(editItem.note ?? "");
    setLoadedEditKey(editKey);
  }, [editKey, editItem, href, hydrated, loadedEditKey, router, sizes]);

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
    addCartItems(itemId, quantity, Math.round(unitPrice * 100), {
      sizeId: selectedSize.id,
      addonIds: selectedAddonIds,
      note,
    });
  }

  const editItemBasePrice = editItem
    ? Math.round(
      (sizes.find((size) => size.id === (editItem.sizeId ?? "medium"))?.price ?? sizes[1].price) * 100,
    ) + (editItem.addonIds ?? []).reduce(
      (sum, addonId) => sum + (itemAddons.find((addon) => addon.id === addonId)?.price ?? 0) * 100,
      0,
    )
    : 0;
  const hasEditChanges = editItem
    ? quantity !== editItem.quantity ||
      Math.round(unitPrice * 100) !== (editItem.unitPrice ?? editItemBasePrice) ||
      [...selectedAddonIds].sort().join(",") !== [...(editItem.addonIds ?? [])].sort().join(",") ||
      note.trim() !== (editItem.note ?? "").trim()
    : false;

  function confirmEdits() {
    if (!editKey || !editItem || !hasEditChanges) return;
    const updatedItem: StoredCartItem = {
      dishId: itemId,
      quantity,
      unitPrice: Math.round(unitPrice * 100),
      sizeId: selectedSize.id,
      addonIds: selectedAddonIds,
      note: note.trim(),
    };
    updateCartItem(editKey, updatedItem);
    router.replace(href("/cart"));
  }

  function handleToggleFavorite() {
    guard(() => {
      const wasFavorite = favoriteIds.includes(itemId);
      toggleFavorite(itemId);
      showToast(wasFavorite ? toastMessages.favoriteRemoved : toastMessages.favoriteAdded);
    });
  }

  function closePage() {
    if (editKey) {
      router.replace(href("/cart"));
      return;
    }
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

        <AddToCartButton
          total={total}
          onAdd={editKey ? confirmEdits : addToCart}
          label={editKey ? dict.cart.confirmEdits : undefined}
          disabled={Boolean(editKey) && (!editItem || loadedEditKey !== editKey || !hasEditChanges)}
        />
      </main>
      {loginModalOpen ? <LoginRequiredModal /> : null}
    </>
  );
}
