import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import AIHighlight from "@/components/landing/AIHighlight";
import Testimonials from "@/components/landing/Testimonials";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <Features />
    <HowItWorks />
    <AIHighlight />
    <Testimonials />
    <CTASection />
    <Footer />
  </div>
);

export default Index;
