
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import MobileApp from "@/components/landing/MobileApp";
import Testimonials from "@/components/landing/Testimonials";
import FuelPrices from "@/components/landing/FuelPrices";
import ContactSection from "@/components/landing/ContactSection";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-fuelGreen-50">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <Hero />
        <Features />
        <MobileApp />
        <Testimonials />
        <FuelPrices />
        <ContactSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
