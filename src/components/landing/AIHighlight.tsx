import { motion } from "framer-motion";
import { Upload, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const AIHighlight = () => (
  <section id="ai-diagnosis" className="section-padding relative overflow-hidden">
    {/* Blue-tinted background */}
    <div className="absolute inset-0 bg-gradient-to-br from-ai-blue/5 via-background to-ai-blue/5 -z-10" />

    <div className="container">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-ai-blue/10 px-4 py-1.5 text-sm font-medium text-ai-blue mb-6">
            <Zap className="h-4 w-4" />
            AI-Powered
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-green-dark mb-4">
            Detect Crop Diseases in Seconds
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md">
            Simply upload a photo of your crop. Our AI engine instantly identifies diseases, pests, and nutrient deficiencies — with actionable treatment plans.
          </p>
          <div className="flex gap-6 mb-8">
            {[
              { label: "95%+ Accuracy", icon: Shield },
              { label: "Instant Results", icon: Zap },
              { label: "50+ Diseases", icon: Upload },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-2 text-sm font-medium text-foreground">
                <stat.icon className="h-4 w-4 text-ai-blue" />
                {stat.label}
              </div>
            ))}
          </div>
          <Button variant="default" size="lg" className="bg-ai-blue hover:bg-ai-blue/90 shadow-lg shadow-ai-blue/20">
            Try AI Diagnosis
          </Button>
        </motion.div>

        {/* AI Demo Card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-2xl border border-border shadow-xl p-8"
        >
          {/* Upload area */}
          <div className="border-2 border-dashed border-ai-blue/30 rounded-xl p-8 text-center mb-6 bg-ai-blue/5">
            <Upload className="h-10 w-10 text-ai-blue/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium">Upload crop image for analysis</p>
          </div>

          {/* Mock result */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Diagnosis Result</span>
              <span className="text-xs font-bold bg-green-light text-primary rounded-full px-3 py-1">Healthy</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Health Score", value: "92%", width: "92%" },
                { label: "Disease Risk", value: "Low", width: "15%" },
                { label: "Nutrient Level", value: "Good", width: "78%" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-ai-blue rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: item.width }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AIHighlight;
