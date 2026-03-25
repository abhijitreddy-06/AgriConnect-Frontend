import { apiRequest } from "@/services/http";

export interface FarmerReview {
  id: number;
  order_id: number;
  reliability_rating: number;
  quality_rating: number;
  rating: number;
  feedback?: string;
  customer_name?: string;
  created_at?: string;
}

interface FarmerReviewsPayload {
  data?: {
    farmerId: number;
    averageRating: number;
    averageReliability: number;
    averageQuality: number;
    totalReviews: number;
    reviews: FarmerReview[];
  };
}

export const farmerReviewService = {
  async getFarmerReviews(farmerId: number) {
    const payload = await apiRequest<FarmerReviewsPayload>(`/farmer-reviews/farmer/${farmerId}`, { method: "GET" });
    return payload.data;
  },

  async create(input: { order_id: number; reliability_rating: number; quality_rating: number; feedback?: string }) {
    return apiRequest("/farmer-reviews", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
