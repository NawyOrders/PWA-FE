import { useAddressStore, type Address, type AddressType } from "@/store/addressStore";
import { useAuthStore } from "@/store/authStore";
import { useCartStore, type CartItem } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useLanguageStore } from "@/store/languageStore";
import { useOrdersStore } from "@/store/ordersStore";
import { useUiStore } from "@/store/uiStore";

/**
 * The stores are module singletons (Zustand), so every test starts from the
 * captured initial state and can opt into a specific seed.
 */
const initialAuth = useAuthStore.getState();
const initialCart = useCartStore.getState();
const initialFavorites = useFavoritesStore.getState();
const initialAddress = useAddressStore.getState();
const initialLanguage = useLanguageStore.getState();
const initialOrders = useOrdersStore.getState();
const initialUi = useUiStore.getState();

export interface StoreSeed {
  auth?: Partial<ReturnType<typeof useAuthStore.getState>>;
  cart?: Partial<ReturnType<typeof useCartStore.getState>>;
  favorites?: Partial<ReturnType<typeof useFavoritesStore.getState>>;
  address?: Partial<ReturnType<typeof useAddressStore.getState>>;
  language?: Partial<ReturnType<typeof useLanguageStore.getState>>;
  orders?: Partial<ReturnType<typeof useOrdersStore.getState>>;
  ui?: Partial<ReturnType<typeof useUiStore.getState>>;
}

/** Restores every store to the state it had when the module was first loaded. */
export function resetStores(): void {
  useAuthStore.setState({ ...initialAuth });
  useCartStore.setState({ ...initialCart });
  useFavoritesStore.setState({ ...initialFavorites });
  useAddressStore.setState({ ...initialAddress });
  useLanguageStore.setState({ ...initialLanguage });
  useOrdersStore.setState({ ...initialOrders });
  useUiStore.setState({ ...initialUi });
}

/** Applies a partial seed on top of the reset state. */
export function applyStoreSeeds(seeds: StoreSeed = {}): void {
  resetStores();
  if (seeds.auth) useAuthStore.setState(seeds.auth);
  if (seeds.cart) useCartStore.setState(seeds.cart);
  if (seeds.favorites) useFavoritesStore.setState(seeds.favorites);
  if (seeds.address) useAddressStore.setState(seeds.address);
  if (seeds.language) useLanguageStore.setState(seeds.language);
  if (seeds.orders) useOrdersStore.setState(seeds.orders);
  if (seeds.ui) useUiStore.setState(seeds.ui);
}

export type { Address, AddressType, CartItem };
