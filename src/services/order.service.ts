import { apiRequest } from "@/services/http";

export interface Order {
  id: string | number;
  status: string;
  quantity: number;
  total_price: number;
  product_name?: string;
  username?: string;
  created_at?: string;
}

interface CreateOrderPayload {
  product_id: number;
  quantity: number;
  delivery_address?: string;
}

interface OrdersResponse {
  data?: {
    data?: Order[];
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  orders?: Order[];
}

export const orderService = {
  async create(payload: CreateOrderPayload) {
    return apiRequest<{ data?: { orderId?: number } }>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async list(params?: { page?: number; limit?: number }) {
    const payload = await apiRequest<OrdersResponse>("/orders", {
      method: "GET",
      query: params,
    });

    if (payload.data?.data) {
      return {
        orders: payload.data.data,
        total: payload.data.total ?? payload.data.data.length,
      };
    }

    return {
      orders: payload.orders ?? [],
      total: (payload.orders ?? []).length,
    };
  },

  async cancel(orderId: number | string) {
    await apiRequest(`/orders/${orderId}/cancel`, {
      method: "PUT",
    });
  },
};
