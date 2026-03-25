import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { articleService } from "@/services/article.service";

const categories = ["All", "Best Practices", "Market Tips", "Farming Guides", "Pest Control"];

const ArticlesPage = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["extension-articles", activeCategory, search],
    queryFn: () => articleService.list({
      category: activeCategory === "All" ? undefined : activeCategory,
      search: search || undefined,
    }),
  });

  const filtered = useMemo(() => articles, [articles]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 pt-20 md:pt-24 pb-12">
        <div className="container max-w-6xl space-y-6">
          <section>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Extension Articles</h1>
            <p className="text-muted-foreground mt-1">Best practices, market tips, and practical farming guides.</p>
          </section>

          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guides, topics, and tags"
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
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading && <p className="text-muted-foreground">Loading articles...</p>}

            {!isLoading && filtered.length === 0 && (
              <p className="text-muted-foreground">No articles found for this filter.</p>
            )}

            {filtered.map((article) => (
              <article key={article.id} className="rounded-2xl border border-accent/20 bg-card p-5 space-y-3">
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

export default ArticlesPage;
