import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import logoImage from "@/assets/newlog.png";

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

  const checkApprovalStatus = async () => {
    try {
      // Get auth token from storage
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Get user data from storage or fetch it if needed
      let currentUserData: UserData | null = null;
      const storedUserData =
        localStorage.getItem("userData") || sessionStorage.getItem("userData");

      if (storedUserData) {
        // Use stored user data if available
        currentUserData = JSON.parse(storedUserData);
      } else {
        // Fetch current user data if not in storage
        const response = await fetch("http://localhost:5001/api/auth/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch user data");
        }

        currentUserData = await response.json();

        // Store the user data for future use
        if (localStorage.getItem("authToken")) {
          localStorage.setItem("userData", JSON.stringify(currentUserData));
        } else {
          sessionStorage.setItem("userData", JSON.stringify(currentUserData));
        }
      }

      if (!currentUserData) {
        throw new Error("User data not available");
      }

      setUserData(currentUserData);

      // Check if the station is approved
      if (currentUserData.station_approved) {
        toast({
          title: "Station Approved!",
          description:
            "Your gas station has been approved. Redirecting to dashboard...",
        });

        setTimeout(() => {
          navigate("/gas-station/dashboard");
        }, 1500);
      } else {
        setStatusMessage(
          "Your gas station registration is pending approval from the administrator."
        );
      }
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
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check status immediately when component mounts
    checkApprovalStatus();

    // Set up polling to check status every 30 seconds
    const interval = setInterval(checkApprovalStatus, 30000);

    // Clean up interval on component unmount
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
              : userData.station_approved
              ? "Approved!"
              : "Awaiting Approval"}
          </h2>
          <p className="text-gray-600">{statusMessage}</p>
          {userData && userData.station_approved && (
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
                  userData.station_approved
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                Status:{" "}
                {userData.station_approved ? "Approved" : "Pending Approval"}
              </p>
            </div>
          </div>
        )}

        {userData && !userData.station_approved && (
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
        )}

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
