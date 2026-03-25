import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Leaf, Check } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { ROUTES } from "@/config/routes";

interface AuthLayoutProps {
  role: "farmer" | "customer";
  mode: "login" | "signup";
  children: ReactNode;
}

const brandContent = {
  farmer: {
    login: {
      title: "Welcome Back 👋",
      subtitle: "Login to continue your journey",
    },
    signup: {
      title: "Create Account 🚀",
      subtitle: "Create your account to get started",
    },
    points: [
      "Sell directly to customers",
      "AI crop disease detection",
      "Smart order management",
    ],
  },
  customer: {
    login: {
      title: "Welcome Back 👋",
      subtitle: "Login to continue your journey",
    },
    signup: {
      title: "Create Account 🚀",
      subtitle: "Create your account to get started",
    },
    points: [
      "Fresh farm produce",
      "Trusted sellers",
      "Easy ordering",
    ],
  },
};

const AuthLayout = ({ role, mode, children }: AuthLayoutProps) => {
  const content = brandContent[role];
  const modeContent = content[mode];
  const isFarmer = role === "farmer";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-secondary/30 dark:from-background dark:via-background dark:to-primary/5">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 lg:p-6">
        <Link
          to={ROUTES.getStarted}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Role Selection
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.root}
            className="flex items-center gap-2 font-display font-bold text-foreground"
          >
            <Leaf className="h-5 w-5 text-primary" />
            AgriConnect
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-4xl rounded-[20px] overflow-hidden shadow-xl border border-border bg-card"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Left branding panel – inside the card */}
            <div
              className={`hidden lg:flex lg:w-[40%] relative overflow-hidden flex-col justify-between p-8 ${
                isFarmer
                  ? "bg-gradient-to-br from-primary to-[hsl(144,61%,15%)]"
                  : "bg-gradient-to-br from-accent to-[hsl(221,83%,33%)]"
              }`}
            >
              <div className="relative z-10">
                <Link
                  to={ROUTES.root}
                  className="flex items-center gap-2 font-display font-bold text-lg text-white/90"
                >
                  <Leaf className="h-5 w-5" />
                  AgriConnect
                </Link>
              </div>

              <motion.div
                key={mode}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="relative z-10 space-y-5"
              >
                <h2 className="font-display font-bold text-2xl xl:text-3xl text-white leading-tight">
                  {modeContent.title}
                </h2>
                <p className="text-white/80 text-sm">{modeContent.subtitle}</p>
                <ul className="space-y-2.5">
                  {content.points.map((point) => (
                    <li key={point} className="flex items-center gap-2.5 text-white/90 text-sm">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-white/20">
                        <Check className="h-3 w-3" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <p className="relative z-10 text-xs text-white/40">
                © {new Date().getFullYear()} AgriConnect
              </p>

              {/* Decorative */}
              <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/5" />
              <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
            </div>

            {/* Right form panel */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-2 font-display font-bold text-foreground mb-6">
                <Leaf className="h-5 w-5 text-primary" />
                AgriConnect
              </div>
              {children}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLayout;
