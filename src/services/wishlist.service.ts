import { apiRequest } from "@/services/http";

export interface WishlistItem {
  productId: number;
  name: string;
  image?: string;
  category?: string;
  quality?: string;
  price: number;
  savedPrice: number;
  farmerName?: string;
  isOrganic?: boolean;
  isEcoCertified?: boolean;
  rating?: number;
  totalReviews?: number;
}

interface WishlistResponse {
  data?: {
    items?: WishlistItem[];
  };
}

interface ToggleResponse {
  data?: {
    wishlisted?: boolean;
  };
}

interface PriceNotification {
  productId: number;
  productName: string;
  image?: string;
  previousPrice: number;
  currentPrice: number;
  dropAmount: number;
}

interface NotificationResponse {
  data?: {
    notifications?: PriceNotification[];
  };
}

export const wishlistService = {
  async list() {
    const payload = await apiRequest<WishlistResponse>("/wishlist", { method: "GET" });
    return payload.data?.items ?? [];
  },

  async toggle(productId: number) {
    const payload = await apiRequest<ToggleResponse>("/wishlist/toggle", {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    });

    return Boolean(payload.data?.wishlisted);
  },

  async notifications() {
    const payload = await apiRequest<NotificationResponse>("/wishlist/notifications", { method: "GET" });
    return payload.data?.notifications ?? [];
  },
};
