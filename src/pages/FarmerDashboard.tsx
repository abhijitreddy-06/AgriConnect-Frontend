import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import AIHighlight from "@/components/landing/AIHighlight";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import heroDashboard from "@/assets/hero-dashboard.png";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const FarmerDashboard = () => (
  <div className="min-h-screen bg-background">
    {/* Hero — same structure as landing but with greeting */}
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="absolute inset-0 bg-gradient-to-b from-green-light/40 to-background -z-10" />
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground mb-6">
              <span className="h-2 w-2 rounded-full bg-primary" />
              AI-Powered Agriculture
            </div>

            <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl tracking-tight text-green-dark leading-[1.1] mb-6">
              {getGreeting()}, Farmer{" "}
              <span className="text-primary">🌱</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              Here's an overview of your farm activity. Manage products, diagnose crops with AI, and connect directly with buyers.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to={ROUTES.farmer.sell}>
                  Start Selling
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to={ROUTES.farmer.market}>Explore Marketplace</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
              <img
                src={heroDashboard}
                alt="AgriConnect dashboard preview"
                className="w-full h-auto"
                loading="eager"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <Features />
    <HowItWorks />
    <AIHighlight />
    <Testimonials />
    <CTASection />
    <Footer />
  </div>
);

export default FarmerDashboard;
