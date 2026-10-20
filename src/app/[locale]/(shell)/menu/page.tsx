"use client";

import { useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUiStore } from "@/store/uiStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { categories, type CategoryId } from "@/data/categories";
import { dishes } from "@/data/dishes";
import { ScreenHeader } from "@/components/ScreenHeader";
import { CategoryCircle } from "@/components/CategoryCircle";
import { ProductCard } from "@/components/ProductCard";

export default function MenuPage() {
  const { dict } = useI18n();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("burger");

  const addToCart = useCartStore((state) => state.add);
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const showToast = useUiStore((state) => state.showToast);
  const openDrawer = useUiStore((state) => state.openDrawer);
  const guard = useAuthGuard();

  const list = useMemo(
    () => dishes.filter((dish) => dish.categoryId === activeCategory),
    [activeCategory],
  );

  const handleFavorite = (dishId: string) => {
    guard(() => {
      const wasFavorite = favoriteIds.includes(dishId);
      toggleFavorite(dishId);
      showToast(wasFavorite ? dict.toast.favoriteRemoved : dict.toast.favoriteAdded);
    });
  };

  return (
    <main className="glow-top min-h-dvh w-full">
      <div className="container-x">
        <ScreenHeader
          kicker={dict.menu.kicker}
          title={dict.menu.title}
          onAction={openDrawer}
          actionLabel={dict.common.menu}
        />

        <section className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1 md:mt-6 md:gap-6 lg:justify-center lg:gap-10 lg:overflow-visible">
          {categories.map((category) => (
            <CategoryCircle
              key={category.id}
              label={dict.categories[category.id]}
              image={category.image}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            />
          ))}
        </section>

        <div className="grid grid-cols-1 gap-3 pt-5 pb-8 md:grid-cols-2 md:gap-4 md:pt-8 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          {list.map((dish) => (
            <ProductCard
              key={dish.id}
              dish={dish}
              isFavorite={favoriteIds.includes(dish.id)}
              onAdd={() => {
                addToCart(dish.id);
                showToast(dict.toast.addedToCart, "success");
              }}
              onToggleFavorite={() => handleFavorite(dish.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
