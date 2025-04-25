
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
        <section id="home">
          <Hero />
        </section>
        <section id="features">
          <Features />
        </section>
        <MobileApp />
        <Testimonials />
        <section id="pricing">
          <FuelPrices />
        </section>
        <section id="contact">
          <ContactSection />
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
