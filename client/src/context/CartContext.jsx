import { useEffect, useMemo, useState } from "react";
import { CartContext } from "./CartContextBase";
const STORAGE_KEY = "merhak-cart";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    total: items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0),
    addItem(product, selection) {
      const key = `${product.id}-${selection.size}-${selection.color?.name || selection.color}`;
      setItems((current) => {
        const existing = current.find((item) => item.key === key);
        if (existing) {
          return current.map((item) => item.key === key
            ? { ...item, quantity: item.quantity + selection.quantity }
            : item);
        }
        return [...current, {
          key,
          productId: product.id,
          name: product.name,
          image: product.image || product.images?.[0] || "",
          size: selection.size,
          color: selection.color?.name || selection.color || "",
          quantity: selection.quantity,
          unitPrice: Number(product.price) + Number(selection.extraPrice || 0),
          customNote: "",
        }];
      });
    },
    updateQuantity(key, quantity) {
      setItems((current) => current
        .map((item) => item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item));
    },
    updateNote(key, customNote) {
      setItems((current) => current.map((item) => item.key === key ? { ...item, customNote } : item));
    },
    removeItem(key) {
      setItems((current) => current.filter((item) => item.key !== key));
    },
    clearCart() {
      setItems([]);
    },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

