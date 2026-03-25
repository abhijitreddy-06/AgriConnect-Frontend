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

  async list(params?: { category?: string; search?: string; farmer_id?: string | number; page?: number; limit?: number }) {
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

  async remove(productId: number | string) {
    await apiRequest(`/products/${productId}`, {
      method: "DELETE",
    });
  },
};
