import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import logoImage from "@/assets/newlog.png";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface StationData {
  id: string;
  en_name: string;
  am_name: string;
  tin_number: string;
  user_id: string;
  address: string;
  availability: boolean;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  logo: string;
  created_at: string;
  updated_at: string | null;
  latitude: number;
  longitude: number;
}

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  profile_pic: string;
  verified: boolean;
  created_at: string;
  updated_at: string | null;
  station_approved: boolean;
}

const GasStationWaiting = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<string>(
    "Checking your approval status..."
  );
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stationData, setStationData] = useState<StationData | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  };

  const checkApprovalStatus = async () => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      let currentUserData: UserData | null = null;
      const storedUserData = localStorage.getItem("userData") || sessionStorage.getItem("userData");

      if (storedUserData) {
        currentUserData = JSON.parse(storedUserData);
      } else {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          setStatusMessage("Your station is pending approval");
          return;
        }

        currentUserData = await response.json();
        if (localStorage.getItem("authToken")) {
          localStorage.setItem("userData", JSON.stringify(currentUserData));
        } else {
          sessionStorage.setItem("userData", JSON.stringify(currentUserData));
        }
      }

      if (!currentUserData) {
        setStatusMessage("Your station is pending approval");
        return;
      }

      setUserData(currentUserData);

      const stationResponse = await fetch(
        `${API_BASE_URL}/api/station/user/${currentUserData.id}`,
        { headers: getAuthHeaders() }
      );

      if (!stationResponse.ok) {
        setStatusMessage("Your station is pending approval");
        return;
      }

      const { data: stationData } = await stationResponse.json();
      setStationData(stationData);

      if (stationData.status === "VERIFIED") {
        toast({
          title: "Station Approved!",
          description: "Your gas station has been approved. Redirecting to dashboard...",
        });
        setTimeout(() => {
          navigate("/gas-station/dashboard");
        }, 1500);
      } else if (stationData.status === "REJECTED") {
        setStatusMessage("Your gas station registration has been rejected. Please contact support.");
      } else {
        setStatusMessage("Your station is pending approval");
      }
    } catch (error: unknown) {
      setStatusMessage("Your station is pending approval");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkApprovalStatus();
    const interval = setInterval(checkApprovalStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userRole");
    sessionStorage.removeItem("userData");
    navigate("/login");
  };

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
            {!userData
              ? "Checking Status..."
              : stationData?.status === "VERIFIED"
              ? "Approved!"
              : stationData?.status === "REJECTED"
              ? "Rejected"
              : "Awaiting Approval"}
          </h2>
          <p className="text-gray-600">{statusMessage}</p>
          {stationData?.status === "VERIFIED" && (
            <p className="text-green-500 mt-2">
              Your gas station has been approved! Redirecting to dashboard...
            </p>
          )}
        </div>

        {loading && (
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuelGreen-500"></div>
          </div>
        )}

        {userData && (
          <div className="bg-fuelGreen-50 p-4 rounded-md mb-6 text-left">
            <h3 className="font-medium text-fuelGreen-700 mb-2">
              Your Account Details:
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Name:</span> {userData.first_name}{" "}
                {userData.last_name}
              </p>
              <p>
                <span className="font-medium">Username:</span>{" "}
                {userData.username}
              </p>
              <p>
                <span className="font-medium">Email:</span> {userData.email}
              </p>
              <p>
                <span className="font-medium">Account Created:</span>{" "}
                {new Date(userData.created_at).toLocaleDateString()}
              </p>
              <p
                className={`font-medium ${
                  stationData?.status === "VERIFIED"
                    ? "text-green-600"
                    : stationData?.status === "REJECTED"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                Status:{" "}
                {stationData?.status === "VERIFIED"
                  ? "Approved"
                  : stationData?.status === "REJECTED"
                  ? "Rejected"
                  : "Pending Approval"}
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-md mb-6 text-left">
          <h3 className="font-medium text-blue-700 mb-2">
            What to expect next:
          </h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>An administrator will review your registration</li>
            <li>Approval typically takes 1-2 business days</li>
            <li>You'll receive an email notification when approved</li>
            <li>This page will automatically update once approved</li>
            <li>You'll then be able to access your gas station dashboard</li>
          </ul>
        </div>

        <div className="text-sm text-gray-500">
          Need help? Contact support at{" "}
          <a
            href="mailto:support@fuel-finder.com"
            className="text-fuelGreen-500 hover:underline"
          >
            support@fuel-finder.com
          </a>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-fuelGreen-500 hover:text-fuelGreen-600 font-medium"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default GasStationWaiting;