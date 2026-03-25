import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    role: "Organic Farmer, Maharashtra",
    content: "AgriConnect helped me sell directly to customers. My income increased by 40% in the first season.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Customer, Delhi",
    content: "I love buying fresh produce directly from farmers. The quality is unmatched and the prices are fair.",
    rating: 5,
  },
  {
    name: "Anil Patel",
    role: "Rice Farmer, Gujarat",
    content: "The AI disease detection saved my entire crop. I detected blight early and treated it in time.",
    rating: 5,
  },
];

const Testimonials = () => (
  <section id="testimonials" className="section-padding">
    <div className="container">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-green-dark mb-4">
          Trusted by Farmers & Customers
        </h2>
        <p className="text-muted-foreground text-lg">Real stories from our growing community.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.4 }}
            className="bg-card rounded-2xl p-8 border border-border shadow-sm"
          >
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-action-yellow text-action-yellow" />
              ))}
            </div>
            <p className="text-foreground leading-relaxed mb-6">"{t.content}"</p>
            <div>
              <p className="font-semibold text-foreground text-sm">{t.name}</p>
              <p className="text-muted-foreground text-xs">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
