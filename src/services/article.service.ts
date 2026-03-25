import { apiRequest } from "@/services/http";

export interface ExtensionArticle {
  id: number;
  title: string;
  category: string;
  summary: string;
  content: string;
  tags: string[];
}

interface ArticleListResponse {
  data?: {
    articles?: ExtensionArticle[];
  };
}

export const articleService = {
  async list(params?: { search?: string; category?: string }) {
    const payload = await apiRequest<ArticleListResponse>("/articles", {
      method: "GET",
      query: params,
    });
    return payload.data?.articles ?? [];
  },
};
