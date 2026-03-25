import Footer from "@/components/landing/Footer";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingCart, Truck, ShieldCheck, Clock3, CloudSun, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import heroDashboard from "@/assets/hero-dashboard.png";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { weatherService } from "@/services/weather.service";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const customerHighlights = [
  {
    icon: ShoppingCart,
    title: "Curated Farm Marketplace",
    description: "Discover fresh produce from verified farmers with transparent pricing.",
  },
  {
    icon: Truck,
    title: "Smooth Order Tracking",
    description: "Track pending, shipped, and delivered orders from one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Sellers",
    description: "Buy directly from farmers with clear product quality and stock details.",
  },
  {
    icon: Clock3,
    title: "Fast Repeat Purchases",
    description: "Use your cart and order history to reorder your staples quickly.",
  },
];

const CustomerHome = () => {
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();

  const { data: weatherData } = useQuery({
    queryKey: ["regional-weather-home"],
    queryFn: () => weatherService.getRegionalWeather({ region: "hyderabad" }),
  });

  return (
  <div className="min-h-screen bg-background flex flex-col">
    <main className="flex-1">
    <section className="relative overflow-hidden pt-24 pb-14 sm:pt-28 sm:pb-16 md:pt-36 md:pb-24">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/15 via-secondary/35 to-background -z-10" />
      <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-accent/15 blur-3xl -z-10" />
      <div className="absolute top-10 -right-16 h-64 w-64 rounded-full bg-primary/15 blur-3xl -z-10" />
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/12 border border-accent/25 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <span className="h-2 w-2 rounded-full bg-accent" />
              Curated Marketplace
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground leading-[1.1] mb-6">
              {getGreeting()} {user?.username ? `${user.username}` : "Customer"}{" "}
              <span className="text-accent">👋</span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
              Shop premium farm produce with elegant browsing, faster ordering, and reliable doorstep delivery.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" className="bg-accent hover:bg-accent/90" asChild>
                <Link to={ROUTES.customer.market}>
                  Browse Products
                  <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-accent/40 text-accent hover:bg-accent/10" asChild>
                <Link to={ROUTES.customer.orders}>My Orders</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden shadow-[0_30px_80px_-42px_hsl(var(--accent)/0.8)] border border-accent/20">
              <img src={heroDashboard} alt="AgriConnect" className="w-full h-auto" loading="eager" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>

    <section className="pb-16">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {customerHighlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08 }}
              whileHover={reduceMotion ? undefined : { y: -6 }}
              className="customer-premium-card p-5"
            >
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1.5">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    <section className="pb-14">
      <div className="container">
        <div className="grid grid-cols-1 gap-4">
          <div className="customer-premium-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <CloudSun className="h-5 w-5 text-accent" />
              <h3 className="font-display font-semibold text-foreground">Regional Weather Snapshot</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-accent/20 p-3">
                <p className="text-muted-foreground">Temperature</p>
                <p className="text-lg font-bold text-foreground">{weatherData?.weather?.temperature ?? "-"}°C</p>
              </div>
              <div className="rounded-lg border border-accent/20 p-3">
                <p className="text-muted-foreground">Humidity</p>
                <p className="text-lg font-bold text-foreground">{weatherData?.weather?.humidity ?? "-"}%</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Pest & Disease Alerts
              </p>
              {(weatherData?.pestDiseaseAlerts ?? []).map((alert) => (
                <p key={alert} className="text-xs text-muted-foreground rounded-md border border-amber-500/20 bg-amber-500/10 p-2">
                  {alert}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
    </main>
    <Footer />
  </div>
  );
};

export default CustomerHome;
