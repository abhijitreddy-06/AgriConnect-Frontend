import { io, type Socket } from "socket.io-client";
import { apiRequest } from "@/services/http";

export interface ChatMessage {
  id: number;
  order_id: number;
  sender_id: number;
  sender_role: "customer" | "farmer";
  sender_name?: string;
  message: string;
  created_at: string;
}

export interface ChatInfo {
  orderId: number;
  productName?: string;
  status: string;
  customerName?: string;
  farmerName?: string;
  partnerId?: number;
  partnerName?: string;
  partnerRole?: "customer" | "farmer";
}

interface ChatMessagesResponse {
  data?: ChatMessage[];
}

interface ChatInfoResponse {
  data?: ChatInfo;
}

let socketClient: Socket | null = null;

const getSocketBaseUrl = () => {
  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? "/api/v1").replace(/\/+$/, "");
  return apiBase.replace(/\/api(\/v\d+)?$/i, "");
};

export const chatService = {
  async getMessages(orderId: number) {
    const payload = await apiRequest<ChatMessagesResponse>(`/chat/${orderId}`, { method: "GET" });
    return payload.data ?? [];
  },

  async getChatInfo(orderId: number) {
    const payload = await apiRequest<ChatInfoResponse>(`/chat/${orderId}/info`, { method: "GET" });
    return payload.data ?? null;
  },

  getSocket() {
    if (!socketClient) {
      socketClient = io(getSocketBaseUrl(), {
        autoConnect: false,
        withCredentials: true,
        transports: ["websocket", "polling"],
      });
    }

    return socketClient;
  },
};
