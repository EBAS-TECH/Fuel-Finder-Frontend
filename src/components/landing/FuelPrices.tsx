
import { ArrowUp, ArrowDown } from "lucide-react";

const FuelPrices = () => {
  const fuelTypes = [
    {
      type: "Benzene",
      price: "112.67",
      unit: "Br/L",
      change: "+11.2",
      changeDirection: "up",
      since: "March 2024",
      effective: "September 2024",
      source: "Ministry of Mines and Petroleum"
    },
    {
      type: "Diesel",
      price: "107.93",
      unit: "Br/L",
      change: "11.2",
      changeDirection: "down",
      since: "March 2024",
      effective: "September 2024",
      source: "Ministry of Mines and Petroleum"
    }
  ];

  return (
    <section className="py-16 bg-fuelGreen-50">
      <div className="container mx-auto px-4 lg:px-0">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          <span className="text-fuelBlue-500">Current </span>
          <span className="text-fuelGreen-500">Fuel Prices</span>
          <span className="text-fuelBlue-500"> in Ethiopia</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {fuelTypes.map((fuel) => (
            <div key={fuel.type} className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-fuelGreen-100 p-2 rounded-md">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#27C06E" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-6 h-6"
                  >
                    <path d="M3 22V12a9 9 0 0 1 9-9h.03"></path>
                    <path d="M3 16h18"></path>
                    <path d="M15 22V9"></path>
                    <path d="M15 5V3"></path>
                    <path d="M19 5a4 4 0 0 0-4 4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-fuelBlue-500">{fuel.type}</h3>
              </div>

              <div className="flex items-baseline mb-6">
                <span className="text-3xl font-bold mr-1">{fuel.price}</span>
                <span className="text-gray-500 text-sm">{fuel.unit}</span>
                
                <div className={`ml-auto flex items-center ${
                  fuel.changeDirection === 'up' ? 'text-red-500' : 'text-green-500'
                }`}>
                  {fuel.changeDirection === 'up' ? (
                    <ArrowUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" />
                  )}
                  <span>{fuel.change} Br/L</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="bg-gray-100 p-2 rounded-md mb-2">
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#27C06E"
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-5 h-5"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Since:</p>
                  <p className="font-medium">{fuel.since}</p>
                </div>
                
                <div>
                  <div className="bg-gray-100 p-2 rounded-md mb-2">
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="#27C06E"
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className="w-5 h-5"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">Effective until:</p>
                  <p className="font-medium">{fuel.effective}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500">Source:</p>
                <div className="flex items-center">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="#27C06E"
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4 mr-2"
                  >
                    <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-3.08"></path>
                    <path d="M18 14h-6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2z"></path>
                  </svg>
                  <p className="font-medium">{fuel.source}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FuelPrices;
