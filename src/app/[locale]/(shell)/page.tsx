"use client";

import { useMemo, useRef, useState } from "react";
import { searchDishes, categorySearchLabels } from "@/lib/search";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/DictionaryProvider";
import { brand } from "@/lib/brand";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useUiStore } from "@/store/uiStore";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { categories, type CategoryId } from "@/data/categories";
import { dishes, featuredDishes } from "@/data/dishes";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchPill } from "@/components/SearchPill";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { CategoryCircle } from "@/components/CategoryCircle";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState } from "@/components/EmptyState";
import { Footer } from "@/components/Footer";
import { SearchIcon } from "@/components/icons";

export default function HomePage() {
  const { locale, dict, pick } = useI18n();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const addToCart = useCartStore((state) => state.add);
  const favoriteIds = useFavoritesStore((state) => state.ids);
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const showToast = useUiStore((state) => state.showToast);
  const openDrawer = useUiStore((state) => state.openDrawer);
  const guard = useAuthGuard();

  const list = useMemo(() => {
    if (search.trim()) {
      return searchDishes(dishes, search, categorySearchLabels);
    }
    if (activeCategory) {
      return dishes.filter((dish) => dish.categoryId === activeCategory);
    }
    return dishes;
  }, [search, activeCategory]);

  const handleAdd = (dishId: string) => {
    addToCart(dishId);
    showToast(dict.toast.addedToCart, "success");
  };

  const handleFavorite = (dishId: string) => {
    guard(() => {
      const wasFavorite = favoriteIds.includes(dishId);
      toggleFavorite(dishId);
      showToast(wasFavorite ? dict.toast.favoriteRemoved : dict.toast.favoriteAdded);
    });
  };

  const handleSearchSubmit = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="glow-top min-h-dvh w-full">
      <div className="container-x">
        <ScreenHeader
          kicker={dict.home.greeting}
          title={pick(brand.name)}
          counter={dict.home.location}
          onAction={openDrawer}
          actionLabel={dict.common.menu}
          className="lg:hidden"
        />

        <div className="hidden pt-12 lg:block">
          <p className="text-[1rem] font-bold text-accent">{dict.home.greeting}</p>
          <h1 className="mt-2 text-[2.5rem] font-extrabold leading-tight text-title">
            {pick(brand.name)}
          </h1>
          <p className="mt-1 text-[1.0625rem] text-muted">{dict.home.location}</p>
        </div>

        <div className="space-y-5 pt-4 md:space-y-8 md:pt-6 lg:space-y-10 lg:pt-6">
          <div className="lg:mx-auto lg:max-w-[45rem]">
            <SearchPill
              value={search}
              onChange={setSearch}
              onSubmit={handleSearchSubmit}
              placeholder={dict.common.search}
              buttonLabel={dict.common.searchShort}
              clearLabel={dict.common.clear}
            />
          </div>

          <div>
            <FeaturedCarousel dishes={featuredDishes} onAdd={(dish) => handleAdd(dish.id)} />
          </div>

          <section className="no-scrollbar flex gap-3 overflow-x-auto pb-1 md:gap-6 lg:justify-center lg:gap-10 lg:overflow-visible">
            {categories.map((category) => (
              <CategoryCircle
                key={category.id}
                label={dict.categories[category.id]}
                image={category.image}
                active={activeCategory === category.id}
                onClick={() =>
                  setActiveCategory((current) => (current === category.id ? null : category.id))
                }
              />
            ))}
          </section>

          <div ref={resultsRef} className="anchor flex items-center justify-between pt-1">
            <h2 className="text-[1.125rem] font-extrabold text-title md:text-[1.375rem]">
              {dict.home.more}
            </h2>
            <Link href={`/${locale}/menu`} className="text-[0.8125rem] font-bold text-primary md:text-[0.9375rem]">
              {dict.common.viewAll}
            </Link>
          </div>

          {list.length > 0 ? (
            <div className="pb-8 lg:pb-0">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                {list.map((dish) => (
                  <ProductCard
                    key={dish.id}
                    dish={dish}
                    isFavorite={favoriteIds.includes(dish.id)}
                    onAdd={() => handleAdd(dish.id)}
                    onToggleFavorite={() => handleFavorite(dish.id)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <EmptyState
                icon={<SearchIcon className="h-8 w-8" />}
                title={dict.home.noResults}
                hint={dict.home.noResultsHint}
              />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
