
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Pricing = () => {
  return (
    <div className="flex flex-col min-h-screen bg-fuelGreen-50">
      <Navbar />
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold text-fuelGreen-500 mb-8">Pricing</h1>
          <p className="text-lg text-gray-600">
            Simple and transparent pricing plans for drivers and station owners.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
