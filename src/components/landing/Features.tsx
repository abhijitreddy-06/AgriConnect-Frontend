import { motion } from "framer-motion";
import { Sprout, Bot, Truck } from "lucide-react";

const features = [
  {
    icon: Sprout,
    title: "Direct Marketplace",
    description: "Sell your produce directly to customers. No middlemen, better prices, stronger relationships.",
    color: "text-primary",
    bg: "bg-secondary",
  },
  {
    icon: Bot,
    title: "AI Crop Disease Detection",
    description: "Upload a photo of your crop and get instant AI-powered disease diagnosis with treatment recommendations.",
    color: "text-ai-blue",
    bg: "bg-accent/10",
  },
  {
    icon: Truck,
    title: "Seamless Order Management",
    description: "Track orders, manage inventory, and handle deliveries — all from a single dashboard.",
    color: "text-primary",
    bg: "bg-secondary",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.45 },
  }),
};

const Features = () => (
  <section id="features" className="section-padding">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-green-dark mb-4">
          Everything You Need to Grow
        </h2>
        <p className="text-muted-foreground text-lg">
          Built for modern farmers and conscious consumers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:shadow-md transition-shadow"
          >
            <div className={`${f.bg} w-12 h-12 rounded-xl flex items-center justify-center mb-5`}>
              <f.icon className={`h-6 w-6 ${f.color}`} />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">{f.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
