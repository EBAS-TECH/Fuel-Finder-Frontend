import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "drivers" | "stations" | "government";

const Features = () => {
  const [activeTab, setActiveTab] = useState<TabType>("drivers");
  const [autoRotate, setAutoRotate] = useState(true);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  // Auto rotate tabs every 3 seconds
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => {
        if (direction === 1) {
          if (prev === "drivers") return "stations";
          if (prev === "stations") return "government";
          return "drivers";
        } else {
          if (prev === "drivers") return "government";
          if (prev === "stations") return "drivers";
          return "stations";
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRotate, direction]);

  const features = {
    drivers: [
      {
        icon: <LocationIcon />,
        title: "Find Nearby Station",
        description:
          "Quickly locate the nearest fuel stations based on your current location or search for options in any area.",
      },
      {
        icon: <ClockIcon />,
        title: "Real-Time Fuel Availability",
        description:
          "Instantly see which nearby stations have fuel in stock and what type is available.",
      },
      {
        icon: <StarIcon />,
        title: "Station Ratings & Reviews",
        description:
          "Check average ratings of gas stations before heading out and give your feedback to stations.",
      },
    ],
    stations: [
      {
        icon: <UpdateIcon />,
        title: "AI Based Summary",
        description:
          "Give tailored advice on how each station can improve, along with a precise summary about each station itself",
      },
      {
        icon: <AnalyticsIcon />,
        title: "View Traffic Analytics",
        description:
          "See how many drivers are searching for your station and optimize your operations.",
      },
      {
        icon: <FeedbackIcon />,
        title: "Customer Feedback",
        description:
          "Receive and respond to customer ratings and reviews to improve your service.",
      },
    ],
    government: [
      {
        icon: <MonitorIcon />,
        title: "Precise AI Summary",
        description:
          "Provide a precise AI-generated summary about the station rankings, including the summary itself, the rank of each station, and the reason each station received its ranking.",
      },
      {
        icon: <ReportIcon />,
        title: "Generate Reports",
        description:
          "Access detailed reports on fuel consumption, availability patterns, and shortage areas.",
      },
      {
        icon: <AlertIcon />,
        title: "Shortage Alerts",
        description:
          "Receive immediate notifications about areas experiencing fuel shortages to take action.",
      },
    ],
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setAutoRotate(false);
    setTimeout(() => setAutoRotate(true), 10000); // Longer pause after manual interaction
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveTab((prev) => {
      if (prev === "drivers") return "government";
      if (prev === "stations") return "drivers";
      return "stations";
    });
    setAutoRotate(false);
    setTimeout(() => {
      setAutoRotate(true);
      setDirection(1); // Reset to forward direction
    }, 10000);
  };

  const handleNext = () => {
    setDirection(1);
    setActiveTab((prev) => {
      if (prev === "drivers") return "stations";
      if (prev === "stations") return "government";
      return "drivers";
    });
    setAutoRotate(false);
    setTimeout(() => setAutoRotate(true), 10000);
  };

  return (
    <section className="py-16 bg-white overflow-hidden relative">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            <span className="text-fuelGreen-500">Fuel Finder</span>
            <span className="text-fuelBlue-500">
              {" "}
              has lots of special features for you
            </span>
          </motion.h2>
        </div>

        <div className="mb-10 relative">
          <div className="flex justify-center border-b relative">
            {(["drivers", "stations", "government"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={cn(
                  "px-6 py-3 font-medium text-lg transition-colors relative",
                  activeTab === tab
                    ? "text-fuelGreen-500"
                    : "text-gray-500 hover:text-fuelGreen-400"
                )}
              >
                {tab === "drivers"
                  ? "Drivers"
                  : tab === "stations"
                  ? "Gas Stations"
                  : "Government"}
                {activeTab === tab && (
                  <motion.div
                    layoutId="underline"
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-fuelGreen-500"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Previous tab"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Next tab"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[300px] relative"
          onMouseEnter={() => setAutoRotate(false)}
          onMouseLeave={() => setAutoRotate(true)}
        >
          <AnimatePresence mode="wait" custom={direction}>
            {features[activeTab].map((feature, index) => (
              <motion.div
                key={`${activeTab}-${index}`}
                custom={direction}
                initial={{ opacity: 0, x: 50 * direction }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 * direction }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous tab"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div className="flex space-x-2">
              {(["drivers", "stations", "government"] as TabType[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      activeTab === tab ? "bg-fuelGreen-500" : "bg-gray-300"
                    }`}
                    aria-label={`Show ${tab} features`}
                  />
                )
              )}
            </div>
            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next tab"
            >
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>
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
    <motion.div
      className="p-6 border rounded-lg bg-fuelGreen-50 hover:shadow-lg transition-shadow h-full"
      whileHover={{ y: -5 }}
    >
      <div className="bg-fuelGreen-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-fuelBlue-500">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

// Icons
const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" />
    <circle cx="12" cy="9" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const StarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const UpdateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <path d="M21 12a9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <path d="M21 21H3" />
    <path d="M18 7V21" />
    <path d="M12 11V21" />
    <path d="M6 15V21" />
  </svg>
);

const FeedbackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
  </svg>
);

const MonitorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const ReportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const AlertIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#27C06E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-8 h-8"
  >
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default Features;
