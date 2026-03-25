import { apiRequest } from "@/services/http";

export interface Product {
  id: string | number;
  name: string;
  price: number;
  category?: string;
  image?: string;
  quality?: string;
  quantity?: number;
  farmerId?: number;
  farmerName?: string;
  rating?: number;
  totalReviews?: number;
  farmerRating?: number;
  farmerTotalReviews?: number;
  isOrganic?: boolean;
  isEcoCertified?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  farmRegion?: string | null;
  distanceKm?: number | null;
}

type RawProduct = {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  quality?: string;
  image?: string;
  category?: string;
  farmer_id?: number;
  farmer_name?: string;
  product_avg_rating?: number;
  product_total_reviews?: number;
  farmer_avg_rating?: number;
  farmer_total_reviews?: number;
  is_organic?: boolean;
  is_eco_certified?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  farm_region?: string | null;
  distance_km?: number | null;
};

interface ProductListResponse {
  data?: {
    data?: RawProduct[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  products?: Product[];
}

interface ProductDetailResponse {
  data?: RawProduct;
  product?: RawProduct;
}

interface RecommendationsResponse {
  data?: {
    customersAlsoBought?: RawProduct[];
    seasonalSuggestions?: RawProduct[];
  };
}

interface SeasonalSuggestionsResponse {
  data?: {
    suggestions?: RawProduct[];
  };
}

const normalizeProduct = (product: RawProduct): Product => ({
  id: product.id,
  name: product.product_name,
  price: Number(product.price ?? 0),
  category: product.category || "Uncategorized",
  image: product.image || "",
  quality: product.quality || "Standard",
  quantity: Number(product.quantity ?? 0),
  farmerId: product.farmer_id,
  farmerName: product.farmer_name,
  rating: Number(product.product_avg_rating ?? 0),
  totalReviews: Number(product.product_total_reviews ?? 0),
  farmerRating: Number(product.farmer_avg_rating ?? 0),
  farmerTotalReviews: Number(product.farmer_total_reviews ?? 0),
  isOrganic: Boolean(product.is_organic),
  isEcoCertified: Boolean(product.is_eco_certified),
  latitude: product.latitude == null ? null : Number(product.latitude),
  longitude: product.longitude == null ? null : Number(product.longitude),
  farmRegion: product.farm_region ?? null,
  distanceKm: product.distance_km == null ? null : Number(product.distance_km),
});

export const productService = {
  async create(payload: {
    product_name: string;
    price: number;
    quantity: number;
    quality?: string;
    description?: string;
    quantity_unit?: string;
    category?: string;
    productImage?: File;
  }) {
    const formData = new FormData();
    formData.append("product_name", payload.product_name);
    formData.append("price", String(payload.price));
    formData.append("quantity", String(payload.quantity));
    if (payload.quality) formData.append("quality", payload.quality);
    if (payload.description) formData.append("description", payload.description);
    if (payload.quantity_unit) formData.append("quantity_unit", payload.quantity_unit);
    if (payload.category) formData.append("category", payload.category);
    if (payload.productImage) formData.append("productImage", payload.productImage);

    return apiRequest<{ data?: { productId?: number }; productId?: number }>("/products", {
      method: "POST",
      body: formData,
    });
  },

  async list(params?: {
    category?: string;
    search?: string;
    farmer_id?: string | number;
    page?: number;
    limit?: number;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    organic?: boolean;
    eco?: boolean;
    max_distance?: number;
    user_lat?: number;
    user_lng?: number;
    seasonal?: boolean;
  }) {
    const payload = await apiRequest<ProductListResponse>("/products", {
      method: "GET",
      query: params,
    });

    if (Array.isArray(payload.data?.data)) {
      return {
        products: payload.data.data.map(normalizeProduct),
        total: payload.data.total ?? payload.data.data.length,
      };
    }

    return {
      products: payload.products ?? [],
      total: (payload.products ?? []).length,
    };
  },

  async getById(productId: number | string) {
    const payload = await apiRequest<ProductDetailResponse>(`/products/${productId}`, {
      method: "GET",
    });

    const raw = payload.data ?? payload.product;
    return raw ? normalizeProduct(raw) : null;
  },

  async getRecommendations(productId: number | string, limit = 6) {
    const payload = await apiRequest<RecommendationsResponse>(`/products/${productId}/recommendations`, {
      method: "GET",
      query: { limit },
    });

    return {
      customersAlsoBought: (payload.data?.customersAlsoBought ?? []).map(normalizeProduct),
      seasonalSuggestions: (payload.data?.seasonalSuggestions ?? []).map(normalizeProduct),
    };
  },

  async getSeasonalSuggestions(limit = 8) {
    const payload = await apiRequest<SeasonalSuggestionsResponse>("/products/seasonal/suggestions", {
      method: "GET",
      query: { limit },
    });

    return {
      suggestions: (payload.data?.suggestions ?? []).map(normalizeProduct),
    };
  },

  async remove(productId: number | string) {
    await apiRequest(`/products/${productId}`, {
      method: "DELETE",
    });
  },
};
