import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Leaf, Menu, X, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { label: "Dashboard", path: ROUTES.farmer.home },
  { label: "Chats", path: ROUTES.farmer.chats },
  { label: "Plant Diagnosis", path: ROUTES.farmer.diagnosis },
  { label: "Guides", path: ROUTES.farmer.articles },
  { label: "Marketplace", path: ROUTES.farmer.market },
  { label: "Add Product", path: ROUTES.farmer.sell },
  { label: "My Listings", path: ROUTES.farmer.myProducts },
  { label: "Order Requests", path: ROUTES.farmer.orders },
];

const DashboardNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const displayName = user?.username?.trim() || "Farmer";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-nav shadow-sm" : "bg-card/80 backdrop-blur-lg border-b border-border"
      }`}
    >
      <div className="container flex items-center justify-between h-16 md:h-18">
        <Link to={ROUTES.farmer.home} className="flex items-center gap-2 font-display font-bold text-xl text-foreground">
          <Leaf className="h-6 w-6 text-primary" />
          AgriConnect
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          <Link to={ROUTES.farmer.profile} className="flex items-center gap-2 pl-3 border-l border-border hover:opacity-90 transition-opacity">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">{displayName}</span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle />
          <button className="text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
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
            className="lg:hidden bg-card border-b border-border"
          >
            <div className="container py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={ROUTES.farmer.profile}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 mt-3 pt-3 border-t border-border"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
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

export default DashboardNavbar;
