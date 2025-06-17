import { ArrowRight } from "lucide-react";
import PrimaryButton from "../PrimaryButton";
import { Link } from "react-router-dom";
import dashboardImage from "../../assets/mock.png";

const Hero = () => {
  return (
    <div className="container mx-auto py-24 px-4 lg:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-fuelGreen-500">Find Fuel Fast.</span>
            <br />
            <span className="text-fuelGreen-500">
              Manage Your Station Smart.
            </span>
          </h1>
          <p className="text-gray-600 mb-8 text-lg max-w-lg">
            Whether you're a driver looking for the nearest available fuel, a
            station updating fuel status, or a government delegate monitoring
            supply, our platform connects everyone in real time.
          </p>

          <PrimaryButton asChild className="text-lg px-6 py-6">
            <Link to="/register" className="flex items-center gap-2">
              Get Started <ArrowRight className="h-5 w-5" />
            </Link>
          </PrimaryButton>
        </div>

        <div className="animate-fade-in animate-delay-200 relative">
          <div className="rounded-lg overflow-hidden ">
            <img
              src={dashboardImage} // Used the imported image
              alt="Fuel Finder Dashboard"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
