import { apiRequest } from "@/services/http";

export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  image?: string;
  quantity_unit?: string;
  quality?: string;
  stock?: number;
  farmer_name?: string;
  subtotal: number;
}

export interface CartSummary {
  items: CartItem[];
  cartTotal: number;
  itemCount: number;
}

type CartEnvelope = {
  data?: CartSummary;
  cartItem?: {
    id: number;
    quantity: number;
  };
};

const normalizeCartItem = (item: CartItem): CartItem => ({
  ...item,
  id: Number(item.id),
  product_id: Number(item.product_id),
  price: Number(item.price ?? 0),
  quantity: Number(item.quantity ?? 0),
  stock: item.stock == null ? undefined : Number(item.stock),
  subtotal: Number(item.subtotal ?? 0),
});

const normalizeCartSummary = (summary?: CartSummary): CartSummary => {
  if (!summary) return { items: [], cartTotal: 0, itemCount: 0 };

  const items = Array.isArray(summary.items) ? summary.items.map(normalizeCartItem) : [];
  return {
    items,
    cartTotal: Number(summary.cartTotal ?? 0),
    itemCount: Number(summary.itemCount ?? items.length),
  };
};

export const cartService = {
  async list(): Promise<CartSummary> {
    const payload = await apiRequest<CartEnvelope>("/cart", {
      method: "GET",
    });

    return normalizeCartSummary(payload.data);
  },

  async add(productId: number, quantity = 1) {
    return apiRequest<CartEnvelope>("/cart", {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  async update(cartItemId: number, quantity: number) {
    await apiRequest("/cart/" + cartItemId, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  },

  async remove(cartItemId: number) {
    await apiRequest("/cart/" + cartItemId, {
      method: "DELETE",
    });
  },

  async clear() {
    await apiRequest("/cart", {
      method: "DELETE",
    });
  },

  async checkout(deliveryAddress?: string) {
    return apiRequest<{ data?: { orderIds?: number[]; warnings?: string[] | null } }>("/cart/checkout", {
      method: "POST",
      body: JSON.stringify({ delivery_address: deliveryAddress }),
    });
  },
};
