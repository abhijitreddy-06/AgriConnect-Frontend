import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Bot, ImagePlus, Loader2, Sparkles } from "lucide-react";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { predictionService } from "@/services/prediction.service";
import { toast } from "sonner";

const FarmerDiagnosis = () => {
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const previewUrl = useMemo(() => {
    if (!selectedFile) return "";
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  const analyzeMutation = useMutation({
    mutationFn: () => {
      if (!selectedFile) {
        throw new Error("Please upload a plant image first");
      }
      return predictionService.analyze({
        image: selectedFile,
        description,
        language: "en",
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Analysis failed";
      toast.error(message);
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-24 pb-16">
        <div className="container max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground">Plant Diagnosis</h1>
            <p className="text-muted-foreground mt-1">Upload a leaf/crop image and add a short symptom description for AI analysis.</p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <label className="text-sm font-semibold text-foreground">Symptoms Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observe on the plant (spots, color changes, wilting, etc.)"
                className="min-h-[140px]"
              />

              <label className="text-sm font-semibold text-foreground">Upload Plant Image</label>
              <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border p-6 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
                <ImagePlus className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">Choose image file</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <Button onClick={() => analyzeMutation.mutate()} disabled={analyzeMutation.isPending} className="w-full" variant="hero">
                {analyzeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" />Analyze Image</>}
              </Button>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-display font-semibold text-lg text-foreground">Analysis Result</h3>

              {previewUrl ? (
                <img src={previewUrl} alt="Uploaded crop" className="w-full h-56 object-cover rounded-xl border border-border" />
              ) : (
                <div className="w-full h-56 rounded-xl border border-border bg-muted/30 flex items-center justify-center text-muted-foreground">
                  <Bot className="h-8 w-8 mr-2" /> No image selected
                </div>
              )}

              {analyzeMutation.data?.data ? (
                <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                  <p className="text-sm"><span className="font-semibold">Diagnosis:</span> {analyzeMutation.data.data.diagnosis || "Unknown"}</p>
                  <p className="text-sm"><span className="font-semibold">Confidence:</span> {analyzeMutation.data.data.confidence ?? "N/A"}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Run an analysis to see diagnosis details.</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FarmerDiagnosis;
