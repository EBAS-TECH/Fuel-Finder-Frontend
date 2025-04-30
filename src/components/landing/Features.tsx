
import { useState } from "react";
import { cn } from "@/lib/utils";

type TabType = "drivers" | "stations" | "government";

const Features = () => {
  const [activeTab, setActiveTab] = useState<TabType>("drivers");

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-fuelGreen-500">Fuel Finder</span>
            <span className="text-fuelBlue-500"> has lots of special features for you</span>
          </h2>
        </div>

        <div className="mb-10">
          <div className="flex justify-center border-b">
            <button 
              onClick={() => setActiveTab("drivers")}
              className={cn(
                "px-6 py-3 font-medium text-lg transition-colors relative",
                activeTab === "drivers" 
                  ? "text-fuelGreen-500 border-b-2 border-fuelGreen-500" 
                  : "text-gray-500 hover:text-fuelGreen-400"
              )}
            >
              Drivers
            </button>
            <button 
              onClick={() => setActiveTab("stations")}
              className={cn(
                "px-6 py-3 font-medium text-lg transition-colors relative",
                activeTab === "stations" 
                  ? "text-fuelGreen-500 border-b-2 border-fuelGreen-500" 
                  : "text-gray-500 hover:text-fuelGreen-400"
              )}
            >
              Gas Stations
            </button>
            <button 
              onClick={() => setActiveTab("government")}
              className={cn(
                "px-6 py-3 font-medium text-lg transition-colors relative",
                activeTab === "government" 
                  ? "text-fuelGreen-500 border-b-2 border-fuelGreen-500" 
                  : "text-gray-500 hover:text-fuelGreen-400"
              )}
            >
              Government
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeTab === "drivers" && (
            <>
              <FeatureCard 
                icon={<LocationIcon />}
                title="Find Nearby Station"
                description="Quickly locate the nearest fuel stations based on your current location or search for options in any area."
              />
              <FeatureCard 
                icon={<ClockIcon />}
                title="Real-Time Fuel Availability"
                description="Instantly see which nearby stations have fuel in stock and what type is available."
              />
              <FeatureCard 
                icon={<StarIcon />}
                title="Station Ratings & Reviews"
                description="Check average ratings of gas stations before heading out and give your feedback to stations."
              />
            </>
          )}

          {activeTab === "stations" && (
            <>
              <FeatureCard 
                icon={<UpdateIcon />}
                title="Update Stock Status"
                description="Easily update your fuel stock levels in real-time so drivers know exactly what's available."
              />
              <FeatureCard 
                icon={<AnalyticsIcon />}
                title="View Traffic Analytics"
                description="See how many drivers are searching for your station and optimize your operations."
              />
              <FeatureCard 
                icon={<FeedbackIcon />}
                title="Customer Feedback"
                description="Receive and respond to customer ratings and reviews to improve your service."
              />
            </>
          )}

          {activeTab === "government" && (
            <>
              <FeatureCard 
                icon={<MonitorIcon />}
                title="Supply Monitoring"
                description="Monitor fuel supply and distribution across different regions in real-time."
              />
              <FeatureCard 
                icon={<ReportIcon />}
                title="Generate Reports"
                description="Access detailed reports on fuel consumption, availability patterns, and shortage areas."
              />
              <FeatureCard 
                icon={<AlertIcon />}
                title="Shortage Alerts"
                description="Receive immediate notifications about areas experiencing fuel shortages to take action."
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="p-6 border rounded-lg bg-fuelGreen-50 hover:shadow-lg transition-shadow animate-fade-in">
      <div className="bg-fuelGreen-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-fuelBlue-500">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Icons
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" />
    <circle cx="12" cy="9" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const UpdateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M21 21H3" />
    <path d="M18 7V21" />
    <path d="M12 11V21" />
    <path d="M6 15V21" />
  </svg>
);

const FeedbackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
  </svg>
);

const MonitorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#27C06E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default Features;
