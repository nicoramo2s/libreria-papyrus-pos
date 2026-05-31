import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { SaleItemType } from '@papyrus/shared';

export type CartItemType = SaleItemType.PRODUCT | SaleItemType.SERVICE;

export interface CartItem {
  id: string;
  itemType: CartItemType;
  productId?: string;
  serviceId?: string;
  name: string;
  price: number;
  quantity: number;
  maxStock?: number;
  specifications?: Record<string, unknown>;
}

interface CartState {
  items: CartItem[];
  discountAmount: number;
  addItem: (item: CartItem) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setDiscountAmount: (amount: number) => void;
  subtotal: () => number;
  total: () => number;
}

const clampMoney = (value: number) => (Number.isFinite(value) ? Math.max(0, value) : 0);

export const CART_STORAGE_KEY = 'papyrus-pos-cart';

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discountAmount: 0,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((cartItem) => cartItem.id === item.id);

          if (!existing) {
            const initialQuantity = Math.max(1, item.quantity);
            const quantity = item.maxStock === undefined ? initialQuantity : Math.min(initialQuantity, item.maxStock);

            if (quantity <= 0) {
              return state;
            }

            return { items: [...state.items, { ...item, quantity }] };
          }

          const nextQuantity = existing.maxStock === undefined
            ? existing.quantity + item.quantity
            : Math.min(existing.quantity + item.quantity, existing.maxStock);

          return {
            items: state.items.map((cartItem) =>
              cartItem.id === item.id ? { ...cartItem, quantity: nextQuantity } : cartItem,
            ),
          };
        }),
      increment: (id) =>
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) {
              return item;
            }

            const nextQuantity = item.maxStock === undefined ? item.quantity + 1 : Math.min(item.quantity + 1, item.maxStock);
            return { ...item, quantity: nextQuantity };
          }),
        })),
      decrement: (id) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity: item.quantity - 1 } : item))
            .filter((item) => item.quantity > 0),
        })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id !== id) return item;
              const clamped = item.maxStock === undefined ? Math.max(1, quantity) : Math.min(Math.max(1, quantity), item.maxStock);
              return { ...item, quantity: clamped };
            })
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clearCart: () => set({ items: [], discountAmount: 0 }),
      setDiscountAmount: (amount) => set({ discountAmount: clampMoney(amount) }),
      subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      total: () => Math.max(0, get().subtotal() - get().discountAmount),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items, discountAmount: state.discountAmount }),
    },
  ),
);
