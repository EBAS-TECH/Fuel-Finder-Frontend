import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import StationImage from "@/assets/image.png";

const DriverDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    toast({
      title: "Web Dashboard Coming Soon",
      description: "Please use our mobile app for full functionality",
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-fuelGreen-50 flex items-center justify-center p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 flex justify-center animate-fade-in">
            <img
              src={StationImage}
              alt="Fuel Finder Mobile App"
              className="max-h-[80vh] object-contain rounded-3xl shadow-lg"
            />
          </div>

          <div className="order-1 lg:order-2 animate-fade-in animate-delay-200">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-fuelGreen-500">Driver Dashboard</span>
              <span className="text-fuelBlue-500"> Coming Soon</span>
            </h1>

            <p className="text-gray-600 mb-8 text-lg">
              Our web dashboard for drivers is currently under development. 
              For now, please use our mobile app to access all driver features 
              including real-time fuel station locations, availability updates, 
              and navigation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#"
                className="inline-flex items-center bg-fuelGreen-500 hover:bg-fuelGreen-600 text-white font-medium py-3 px-6 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="w-6 h-6 mr-2 fill-current"
                >
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                Get it On Google Play
              </a>

              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center border border-fuelGreen-500 text-fuelGreen-500 hover:bg-fuelGreen-50 font-medium py-3 px-6 rounded-md transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;