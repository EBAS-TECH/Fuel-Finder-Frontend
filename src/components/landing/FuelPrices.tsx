import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface FuelPrice {
  id: string;
  fuel_type: string;
  price: number;
  created_at: string;
  updated_at: string;
}

interface FormattedFuelPrice {
  type: string;
  price: string;
  unit: string;
  since: string;
  effective: string;
  source: string;
}

const FuelPrices = () => {
  const [fuelPrices, setFuelPrices] = useState<FormattedFuelPrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFuelPrices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/price`);
        if (!response.ok) {
          throw new Error("Failed to fetch fuel prices");
        }
        const data = await response.json();

        if (data.success && data.data) {
          // Format the API data
          const formattedData = data.data.map((price: FuelPrice) => {
            const fuelType = price.fuel_type === "PETROL" ? "Petrol" : price.fuel_type;

            return {
              type: fuelType,
              price: price.price.toFixed(2),
              unit: "Br/L",
              since: new Date(price.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              }),
              effective: new Date(price.updated_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              }),
              source: "Ministry of Mines and Petroleum",
            };
          });

          setFuelPrices(formattedData);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchFuelPrices();
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-fuelGreen-50">
        <div className="container mx-auto px-4 lg:px-0">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
            <span className="text-fuelBlue-500">Current </span>
            <span className="text-fuelGreen-500">Fuel Prices</span>
            <span className="text-fuelBlue-500"> in Ethiopia</span>
          </h2>
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-fuelGreen-500" />
              <p className="mt-2 text-lg text-fuelBlue-500">
                Loading fuel prices...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-fuelGreen-50">
        <div className="container mx-auto px-4 lg:px-0">
          <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
            <span className="text-fuelBlue-500">Current </span>
            <span className="text-fuelGreen-500">Fuel Prices</span>
            <span className="text-fuelBlue-500"> in Ethiopia</span>
          </h2>
          <div className="flex justify-center">
            <div className="text-center text-red-500 max-w-md">
              <p className="text-lg font-medium">Error loading fuel prices</p>
              <p className="mt-2">{error}</p>
              <p className="mt-4 text-sm text-gray-500">
                Please try again later or check your internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-fuelGreen-50">
      <div className="container mx-auto px-4 lg:px-0">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">
          <span className="text-fuelBlue-500">Current </span>
          <span className="text-fuelGreen-500">Fuel Prices</span>
          <span className="text-fuelBlue-500"> in Ethiopia</span>
        </h2>

        {fuelPrices.length === 0 ? (
          <div className="flex justify-center">
            <div className="text-center text-gray-500">
              <p>No fuel price data available</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {fuelPrices.map((fuel) => (
              <div
                key={fuel.type}
                className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-fuelGreen-100 p-2 rounded-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#4dcf07"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-fuel"
                    >
                      <line x1="3" x2="15" y1="22" y2="22" />
                      <line x1="4" x2="14" y1="9" y2="9" />
                      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
                      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-fuelBlue-500">
                    {fuel.type}
                  </h3>
                </div>

                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold mr-1">{fuel.price}</span>
                  <span className="text-gray-500 text-sm">{fuel.unit}</span>
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
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
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
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
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
                      <path d="M20 11.08V8l-6-6H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-3.08" />
                      <path d="M18 14h-6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v0a2 2 0 0 0-2-2z" />
                    </svg>
                    <p className="font-medium">{fuel.source}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FuelPrices;