import { create } from "zustand";

const CART_STORAGE_KEY = "recruitorai:cart";
const QUANTITY_DEBOUNCE_MS = 500;

export interface CartItem {
  id: string;
  collectionId: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface AddToCartInput {
  collectionId: string;
  itemId: string;
  quantity?: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  isLoading: boolean;
  addingItemId: string | null;
  isCheckingOut: boolean;
  error: string | null;
  _quantityTimers: Map<string, NodeJS.Timeout>;
  _initialized: boolean;
}

interface CartActions {
  addToCart: (input: AddToCartInput) => Promise<void>;
  removeFromCart: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  _fetchCart: () => Promise<void>;
  _sendQuantityUpdate: (lineItemId: string, quantity: number) => Promise<void>;
}

type CartStore = CartState & { actions: CartActions };

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  isLoading: false,
  addingItemId: null,
  isCheckingOut: false,
  error: null,
  _quantityTimers: new Map(),
  _initialized: false,

  actions: {
    _fetchCart: async () => {
      if (get()._initialized) return;
      set({ isLoading: true, error: null });
      const items = readCart();
      set({ items, isLoading: false, _initialized: true });
    },

    addToCart: async (input: AddToCartInput) => {
      set({ addingItemId: input.itemId, error: null });
      const items = [...get().items];
      const existing = items.find(
        (item) => item.collectionId === input.collectionId && item.itemId === input.itemId
      );
      if (existing) {
        existing.quantity += input.quantity ?? 1;
      } else {
        items.push({
          id: crypto.randomUUID(),
          collectionId: input.collectionId,
          itemId: input.itemId,
          quantity: input.quantity ?? 1,
          name: `Item ${input.itemId}`,
          price: 0,
        });
      }
      writeCart(items);
      set({ items, addingItemId: null, _initialized: true });
    },

    removeFromCart: (item: CartItem) => {
      const items = get().items.filter((i) => i.id !== item.id);
      writeCart(items);
      set({ items });
    },

    _sendQuantityUpdate: async (lineItemId: string, quantity: number) => {
      const items = [...get().items];
      const idx = items.findIndex((i) => i.id === lineItemId);
      if (idx === -1) return;
      if (quantity <= 0) {
        items.splice(idx, 1);
      } else {
        items[idx] = { ...items[idx], quantity };
      }
      writeCart(items);
      set({ items });
    },

    updateQuantity: (item: CartItem, quantity: number) => {
      const { _quantityTimers, actions } = get();
      const items = get()
        .items.map((i) => (i.id === item.id ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0);
      set({ items });

      const existingTimer = _quantityTimers.get(item.id);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(() => {
        _quantityTimers.delete(item.id);
        actions._sendQuantityUpdate(item.id, quantity);
      }, QUANTITY_DEBOUNCE_MS);

      _quantityTimers.set(item.id, timer);
    },

    clearCart: () => {
      writeCart([]);
      set({ items: [] });
    },

    checkout: async () => {
      set({ isCheckingOut: true, error: null });
      if (typeof window !== "undefined") {
        window.alert("Checkout is disabled in non-Wix mode.");
      }
      set({ isCheckingOut: false });
    },

    toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    openCart: () => set({ isOpen: true }),
    closeCart: () => set({ isOpen: false }),
  },
}));

export const useCart = () => {
  const store = useCartStore();

  if (!store._initialized && !store.isLoading) {
    store.actions._fetchCart();
  }

  return {
    items: store.items,
    isOpen: store.isOpen,
    isLoading: store.isLoading,
    addingItemId: store.addingItemId,
    isCheckingOut: store.isCheckingOut,
    error: store.error,
    actions: store.actions,
  };
};
