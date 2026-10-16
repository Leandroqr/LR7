"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product, ProductId, ProductVariant } from "@/types/ecommerce";

export type CartCustomization = {
  enabled: boolean;
  name: string;
  number: string;
  placement: "back";
  price: number;
};

export type CartItem = {
  product: Product;
  variant?: ProductVariant;
  size: string;
  customName: string;
  customNumber: string;
  customization?: CartCustomization;
  unitPrice?: number;
  quantity: number;
};

type StoreContextValue = {
  cart: CartItem[];
  favorites: ProductId[];
  hydrated: boolean;
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQty: (index: number, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: ProductId) => void;
  cartCount: number;
  favoriteCount: number;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<ProductId[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("cart");
      const storedFavorites = localStorage.getItem("favs");
      if (storedCart) {
        setCart(JSON.parse(storedCart) as CartItem[]);
      }
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites) as ProductId[]);
      }
    } catch {
      setCart([]);
      setFavorites([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("favs", JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const addToCart = (item: CartItem) => {
    setCart((previous) => {
      const existingIndex = previous.findIndex(
        (entry) =>
          entry.product.id === item.product.id &&
          entry.size === item.size &&
          entry.variant?.sku === item.variant?.sku &&
          (entry.variant?.color ?? "") === (item.variant?.color ?? "") &&
          entry.customName === item.customName &&
          entry.customNumber === item.customNumber &&
          (entry.customization?.placement ?? "back") === (item.customization?.placement ?? "back"),
      );

      if (existingIndex >= 0) {
        const next = [...previous];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + item.quantity,
        };
        return next;
      }

      return [...previous, item];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((previous) => previous.filter((_, current) => current !== index));
  };

  const updateQty = (index: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(index);
      return;
    }

    setCart((previous) => {
      const next = [...previous];
      next[index] = { ...next[index], quantity };
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (productId: ProductId) => {
    setFavorites((previous) =>
      previous.includes(productId)
        ? previous.filter((id) => id !== productId)
        : [...previous, productId],
    );
  };

  const value: StoreContextValue = {
    cart,
    favorites,
    hydrated,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    toggleFavorite,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    favoriteCount: favorites.length,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }
  return context;
}
