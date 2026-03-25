import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import RoleCard from "@/components/RoleCard";
import { Sprout, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { ROUTES } from "@/config/routes";

const GetStarted = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />

    <section className="relative flex items-center justify-center flex-1 pt-24 pb-16">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-light/30 via-background to-background -z-10" />

      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            Choose Your Role
          </h1>
          <p className="text-lg text-muted-foreground">
            Start your journey with AgriConnect
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <RoleCard
            icon={Sprout}
            title="I am a Farmer"
            description="Sell your products, manage orders, and use AI to detect crop diseases."
            cta="Continue as Farmer"
            href={ROUTES.auth.farmerLogin}
            accentClass="bg-secondary text-primary"
            borderClass="hover:border-primary"
            delay={0.1}
          />
          <RoleCard
            icon={ShoppingCart}
            title="I am a Customer"
            description="Browse fresh farm products and buy directly from farmers."
            cta="Continue as Customer"
            href={ROUTES.auth.customerLogin}
            accentClass="bg-accent/10 text-accent"
            borderClass="hover:border-accent"
            delay={0.2}
          />
        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default GetStarted;
