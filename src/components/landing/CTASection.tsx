import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="section-padding">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-3xl bg-gradient-to-br from-[hsl(var(--cta-from))] to-primary p-12 md:p-20 text-center overflow-hidden"
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <h2 className="relative font-display font-bold text-3xl md:text-5xl text-primary-foreground mb-4">
          Start Selling or Buying Today
        </h2>
        <p className="relative text-primary-foreground/80 text-lg max-w-lg mx-auto mb-8">
          Join thousands of farmers and customers building a better food system together.
        </p>
        <div className="relative flex flex-wrap justify-center gap-4">
          <Button variant="action" size="xl">
            Get Started Free
            <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="xl"
            className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
          >
            Contact Sales
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);

export default CTASection;
