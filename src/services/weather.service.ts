import { apiRequest } from "@/services/http";

interface WeatherResponse {
  data?: {
    weather?: {
      region: string;
      temperature: number;
      humidity: number;
      precipitation: number;
      windSpeed: number;
      observedAt?: string;
    };
    pestDiseaseAlerts?: string[];
  };
}

export const weatherService = {
  async getRegionalWeather(params?: { region?: string; lat?: number; lng?: number }) {
    const payload = await apiRequest<WeatherResponse>("/weather/region", {
      method: "GET",
      query: params,
    });
    return payload.data;
  },
};
