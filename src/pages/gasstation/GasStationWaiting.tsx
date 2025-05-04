import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import logoImage from '@/assets/newlog.png';

interface Station {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  status: "PENDING" | "VERIFIED" | "NOT-VERIFIED";
  rejectionReason?: string;
  createdAt: string;
}

interface JwtPayload {
  userId: string;
  // Add other expected fields from your JWT payload
}

const GasStationWaiting = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>("Checking your approval status...");
  const [stationData, setStationData] = useState<Station | null>(null);

  const parseJwt = (token: string): JwtPayload => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      throw new Error("Failed to parse JWT token");
    }
  };

  const checkApprovalStatus = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // First try to get the specific station for this user
      const payload = parseJwt(token);
      const response = await fetch(`http://localhost:5001/api/station/user/${payload.userId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        // If specific station not found, try getting all stations (fallback)
        const allStationsResponse = await fetch("http://localhost:5001/api/stations", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (!allStationsResponse.ok) {
          const errorData = await allStationsResponse.json();
          throw new Error(errorData.message || "Failed to check approval status");
        }

        const allStations: Station[] = await allStationsResponse.json();
        const currentStation = allStations.find(station => station.ownerId === payload.userId);

        if (!currentStation) {
          throw new Error("Station information not found");
        }
        setStationData(currentStation);
        handleStatus(currentStation);
        return;
      }

      const currentStation: Station = await response.json();
      setStationData(currentStation);
      handleStatus(currentStation);
    } catch (error: unknown) {
      let errorMessage = "Error checking approval status";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setStatusMessage(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleStatus = (station: Station) => {
    switch (station.status) {
      case "VERIFIED":
        toast({
          title: "Approved!",
          description: "Your gas station has been approved by admin.",
        });
        navigate("/gas-station/dashboard");
        break;
      case "NOT-VERIFIED":
        setStatusMessage("Your application was not approved. Please contact support.");
        break;
      default:
        setStatusMessage("Your gas station is still pending approval. Please wait...");
    }
  };

  useEffect(() => {
    checkApprovalStatus();
    const interval = setInterval(checkApprovalStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-fuelGreen-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-8">
          <img 
            src={logoImage} 
            alt="Fuel Finder Logo"
            className="h-32 w-auto mx-auto"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-fuelBlue-500 mb-2">
            {stationData?.status === "NOT-VERIFIED" ? "Application Rejected" : "Awaiting Approval"}
          </h2>
          <p className="text-gray-600">
            {statusMessage}
          </p>
          {stationData?.status === "NOT-VERIFIED" && (
            <p className="text-red-500 mt-2">
              Reason: {stationData.rejectionReason || "Not specified"}
            </p>
          )}
        </div>

        {checkingStatus && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuelGreen-500"></div>
          </div>
        )}

        {stationData && (
          <div className="bg-fuelGreen-50 p-4 rounded-md mb-6 text-left">
            <h3 className="font-medium text-fuelGreen-700 mb-2">
              Your Station Details:
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Name:</span> {stationData.name}</p>
              <p><span className="font-medium">Location:</span> {stationData.location}</p>
              <p><span className="font-medium">Submitted:</span> {new Date(stationData.createdAt).toLocaleDateString()}</p>
              {stationData.status === "PENDING" && (
                <p className="text-yellow-600 font-medium">Status: Pending Approval</p>
              )}
              {stationData.status === "NOT-VERIFIED" && (
                <p className="text-red-600 font-medium">Status: Not Approved</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-md mb-6 text-left">
          <h3 className="font-medium text-blue-700 mb-2">
            {stationData?.status === "NOT-VERIFIED" ? "Next Steps:" : "What to expect next:"}
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {stationData?.status === "NOT-VERIFIED" ? (
              <>
                <li>Please review the rejection reason above</li>
                <li>Correct any issues and resubmit your application</li>
                <li>Contact support if you need assistance</li>
              </>
            ) : (
              <>
                <li>Admin will review your registration</li>
                <li>Approval typically takes 1-2 business days</li>
                <li>You'll receive an email notification</li>
                <li>This page will automatically update</li>
              </>
            )}
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          Need help? Contact support at{" "}
          <a href="mailto:support@fuel-finder.com" className="text-fuelGreen-500 hover:underline">
            support@fuel-finder.com
          </a>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        {stationData?.status === "NOT-VERIFIED" && (
          <button
            onClick={() => navigate("/gas-station/register")}
            className="px-4 py-2 bg-fuelGreen-500 text-white rounded-md hover:bg-fuelGreen-600"
          >
            Edit Application
          </button>
        )}
        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
            navigate("/login");
          }}
          className="px-4 py-2 text-fuelGreen-500 hover:text-fuelGreen-600 font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default GasStationWaiting;