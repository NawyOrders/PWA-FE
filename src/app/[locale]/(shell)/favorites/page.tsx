"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUiStore } from "@/store/uiStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { getDish } from "@/data/dishes";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { ProductListSkeleton } from "@/components/skeletons/ProductListSkeleton";
import { HeartIcon } from "@/components/icons";

export default function FavoritesPage() {
  const { locale, dict, t } = useI18n();
  const router = useRouter();
  const hydrated = useUiStore((state) => state.hydrated);
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const addToCart = useCartStore((state) => state.add);
  const showToast = useUiStore((state) => state.showToast);
  const openDrawer = useUiStore((state) => state.openDrawer);
  const guard = useAuthGuard();

  const items = favoriteIds
    .map((id) => getDish(id))
    .filter((dish): dish is NonNullable<typeof dish> => Boolean(dish));

  return (
    <main className="min-h-dvh w-full">
      <div className="container-x">
        <ScreenHeader
          kicker={dict.favorites.kicker}
          title={dict.favorites.title}
          counter={t(dict.favorites.count, { count: items.length })}
          action="menu"
          onAction={openDrawer}
          actionLabel={dict.common.menu}
          closeAction={() => router.replace(`/${locale}`)}
          closeLabel={dict.common.close}
        />

        <div className="pt-5">
          {!hydrated ? (
            <ProductListSkeleton />
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 pb-8 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
              {items.map((dish) => (
                <ProductCard
                  key={dish.id}
                  dish={dish}
                  isFavorite
                  onAdd={() => {
                    addToCart(dish.id);
                    showToast(dict.toast.addedToCart, "success");
                  }}
                  onToggleFavorite={() =>
                    guard(() => {
                      toggleFavorite(dish.id);
                      showToast(dict.toast.favoriteRemoved);
                    })
                  }
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<HeartIcon className="h-8 w-8" />}
              title={dict.favorites.empty}
              hint={dict.favorites.emptyHint}
              actionLabel={dict.favorites.browse}
              onAction={() => router.push(`/${locale}/menu`)}
            />
          )}
        </div>
      </div>
    </main>
  );
}
