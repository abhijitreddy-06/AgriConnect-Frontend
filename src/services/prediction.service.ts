import { apiRequest } from "@/services/http";

export interface PredictionResult {
  predictionId?: number;
  data?: {
    diagnosis?: string;
    confidence?: number | null;
    details?: string;
  };
}

export const predictionService = {
  async analyze(payload: { image: File; description?: string; language?: string }) {
    const formData = new FormData();
    formData.append("imageInput", payload.image);
    if (payload.description) formData.append("description", payload.description);
    if (payload.language) formData.append("language", payload.language);

    return apiRequest<PredictionResult>("/predict/analyze", {
      method: "POST",
      body: formData,
    });
  },
};
