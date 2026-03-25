import { motion } from "framer-motion";
import { ListPlus, ScanSearch, ShoppingBag } from "lucide-react";

const steps = [
  { icon: ListPlus, title: "List Your Products", description: "Create your farm profile and list fresh produce in minutes." },
  { icon: ScanSearch, title: "AI Diagnoses Crops", description: "Upload crop images for instant AI-powered health analysis." },
  { icon: ShoppingBag, title: "Customers Buy Directly", description: "Buyers browse, order, and receive farm-fresh products." },
];

const HowItWorks = () => (
  <section id="how-it-works" className="section-padding bg-secondary/50">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-green-dark mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground text-lg">Three simple steps to get started.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 relative">
        {/* Connector line */}
        <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-0.5 bg-border" />

        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="flex flex-col items-center text-center relative"
          >
            <div className="relative z-10 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-5 shadow-lg shadow-primary/20">
              <s.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-muted-foreground mb-2">STEP {i + 1}</span>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">{s.title}</h3>
            <p className="text-muted-foreground text-sm max-w-xs">{s.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
