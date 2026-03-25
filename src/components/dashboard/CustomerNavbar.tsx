import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Home", path: ROUTES.customer.home },
  { label: "Marketplace", path: ROUTES.customer.market },
  { label: "Wishlist", path: ROUTES.customer.wishlist },
  { label: "Guides", path: ROUTES.customer.articles },
  { label: "Cart", path: ROUTES.customer.cart },
  { label: "Orders", path: ROUTES.customer.orders },
  { label: "Profile", path: ROUTES.customer.profile },
];

const CustomerNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const displayName = user?.username?.trim() || "Customer";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/85 backdrop-blur-xl border-b border-accent/25 shadow-[0_10px_30px_-22px_hsl(var(--accent)/0.7)]"
          : "bg-card/70 backdrop-blur-lg border-b border-accent/15"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        <Link to={ROUTES.customer.home} className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
          <Leaf className="h-6 w-6 text-accent drop-shadow-[0_0_12px_hsl(var(--accent)/0.5)]" />
          AgriConnect
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? "bg-accent text-accent-foreground shadow-[0_8px_22px_-12px_hsl(var(--accent)/0.8)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to={ROUTES.customer.profile} className="flex items-center gap-2 pl-3 border-l border-border hover:opacity-90 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-accent/12 border border-accent/30 flex items-center justify-center">
              <User className="h-4 w-4 text-accent" />
            </div>
            <span className="text-sm font-medium text-foreground">{displayName}</span>
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button type="button" className="text-foreground h-10 w-10 rounded-lg flex items-center justify-center" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-accent/20"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={ROUTES.customer.profile}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 mt-3 pt-3 border-t border-border"
              >
                <div className="h-8 w-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-accent" />
                </div>
                <span className="text-sm font-medium text-foreground">{displayName}</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default CustomerNavbar;
