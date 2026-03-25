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

interface SendMessageResponse {
  data?: ChatMessage;
}

export const chatService = {
  async getMessages(orderId: number) {
    const payload = await apiRequest<ChatMessagesResponse>(`/chat/${orderId}`, { method: "GET" });
    return payload.data ?? [];
  },

  async getChatInfo(orderId: number) {
    const payload = await apiRequest<ChatInfoResponse>(`/chat/${orderId}/info`, { method: "GET" });
    return payload.data ?? null;
  },

  async sendMessage(orderId: number, message: string) {
    const payload = await apiRequest<SendMessageResponse>(`/chat/${orderId}`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
    return payload.data ?? null;
  },
};
