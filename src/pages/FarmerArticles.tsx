import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, Sprout, TrendingUp } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { articleService } from "@/services/article.service";

const categories = ["All", "Best Practices", "Market Tips", "Farming Guides", "Pest Control"];

const FarmerArticles = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["farmer-extension-articles", activeCategory, search],
    queryFn: () => articleService.list({
      category: activeCategory === "All" ? undefined : activeCategory,
      search: search || undefined,
    }),
  });

  const filtered = useMemo(() => articles, [articles]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-24 pb-12">
        <div className="container max-w-6xl space-y-6">
          <section>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Farmer Guides</h1>
            <p className="text-muted-foreground mt-1">Actionable farming knowledge: crop care, pest control, and market strategy.</p>
          </section>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><Sprout className="h-4 w-4 text-primary" /> Crop Practice Focus</p>
              <p className="text-xs text-muted-foreground mt-1">Prioritize practical techniques that improve yield, quality, and crop health.</p>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Market Readiness Focus</p>
              <p className="text-xs text-muted-foreground mt-1">Use pricing and post-harvest guidance to improve consistency and margins.</p>
            </div>
          </div>

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guides, tags, and techniques"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  category === activeCategory
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading && <p className="text-muted-foreground">Loading guides...</p>}

            {!isLoading && filtered.length === 0 && (
              <p className="text-muted-foreground">No guides found for this filter.</p>
            )}

            {filtered.map((article) => (
              <article key={article.id} className="rounded-2xl border border-primary/20 bg-card p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{article.title}</h3>
                  <Badge variant="secondary">{article.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{article.summary}</p>
                <p className="text-sm text-foreground/90 leading-relaxed">{article.content}</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs rounded-full border px-2 py-1 text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerArticles;
