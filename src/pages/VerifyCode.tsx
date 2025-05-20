import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PrimaryButton from "@/components/PrimaryButton";
import { useToast } from "@/components/ui/use-toast";
import VerificationInput from "@/components/auth/VerificationInput";
import logoImage from '../assets/logo.png';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VerifyCode = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("userId") || localStorage.getItem("tempUserId");
  const email = localStorage.getItem("tempUserEmail");

  const handleVerify = async (code) => {
    if (!code || code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a complete 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (!userId || !email) {
        throw new Error("Your verification session has expired. Please register again.");
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/verify/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Verification failed. Please try again.");
      }

      localStorage.removeItem("tempUserId");
      localStorage.removeItem("tempUserEmail");
      window.location.href = "/login";
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      if (!userId) {
        throw new Error("We couldn't identify your account. Please try registering again.");
      }

      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/resend/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned an unexpected response");
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send a new verification code.");

      toast({
        title: "New Code Sent!",
        description: result.message || "A new verification code has been sent to your email.",
      });
    } catch (error) {
      const errorMessage = error.message.startsWith("<") || error.message.startsWith("{") 
        ? "Failed to resend verification code. Please try again." 
        : error.message;

      toast({
        title: "Failed to Resend",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const BackButton = ({ mobile = false }) => (
    <Link
      to="/"
      className={`${mobile ? "md:hidden" : "hidden md:flex"} text-fuelGreen-500 flex items-center hover:text-fuelGreen-600 transition-colors ${mobile ? "text-sm mb-8" : "mt-12"}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`${mobile ? "h-4 w-4 mr-1" : "h-5 w-5 mr-2"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
          clipRule="evenodd"
        />
      </svg>
      Back to Landing Page
    </Link>
  );

  return (
    <div className="min-h-screen bg-fuelGreen-50 flex">
      {/* Left side - Logo area */}
      <div className="hidden md:flex md:w-1/2 bg-fuelGreen-50 p-8 flex-col items-center justify-center">
        <div className="flex flex-col items-center max-w-md">
          <div className="mb-12 scale-150">
            <img
              src={logoImage}
              alt="Fuel Finder Logo"
              className="h-[160px] w-[160px] rounded-full border-2 border-green-500 object-cover shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-center text-fuelGreen-500 mb-6">
            Fuel Finder App
          </h1>
        </div>
        <BackButton />
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <BackButton mobile />
          
          <h2 className="text-3xl font-bold mb-4 text-center">Verification</h2>
          <p className="text-gray-600 mb-8 text-center">
            Enter the 6-digit code sent to{" "}
            {email ? email.replace(/(.{2}).*@/, "$1****@") : "your email"}
          </p>

          <div className="mb-8">
            <div className="flex justify-center mb-8">
              <VerificationInput
                length={6}
                onComplete={handleVerify}
                disabled={isSubmitting}
              />
            </div>

            <PrimaryButton
              onClick={() => handleVerify("000000")}
              className="w-full py-6 font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Verifying..." : "Verify Account"}
            </PrimaryButton>

            <div className="text-center mt-6">
              <button
                onClick={handleResendCode}
                className="text-fuelGreen-500 hover:underline"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Resend Verification Code"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;