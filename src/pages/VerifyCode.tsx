import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Logo from "@/components/Logo";
import PrimaryButton from "@/components/PrimaryButton";
import { useToast } from "@/components/ui/use-toast";
import VerificationInput from "@/components/auth/VerificationInput";

const VerifyCode = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get user ID from URL params or localStorage
  const userId =
    searchParams.get("userId") || localStorage.getItem("tempUserId");
  const email = localStorage.getItem("tempUserEmail");

  const handleVerify = async (code: string) => {
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
        throw new Error(
          "Your verification session has expired. Please register again."
        );
      }

      const verifyResponse = await fetch(
        `http://localhost:5001/api/auth/verify/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: code }),
        }
      );

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok || !verifyData.verified) {
        throw new Error(
          verifyData.message || "Verification failed. Please try again."
        );
      }

      // Show success toast first
      toast({
        title: "Verified Successfully!",
        description: "Your account has been verified. Redirecting to login...",
      });

      // Clear storage
      localStorage.removeItem("tempUserId");
      localStorage.removeItem("tempUserEmail");

      // Then navigate after a short delay to ensure toast is visible
      setTimeout(() => {
        console.log("Navigating to login page...");
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error: any) {
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
        throw new Error(
          "We couldn't identify your account. Please try registering again."
        );
      }

      setIsSubmitting(true);
      const response = await fetch(
        "http://localhost:5001/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to send a new verification code."
        );
      }

      toast({
        title: "New Code Sent!",
        description: "Please check your email for the verification code.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-fuelGreen-50 flex">
      {/* Left side - Logo area */}
      <div className="hidden md:flex md:w-1/2 bg-fuelGreen-50 p-8 flex-col items-center justify-center">
        <div className="flex flex-col items-center max-w-md">
          <Logo className="mb-12 scale-150" />
          <h1 className="text-4xl font-bold text-center text-fuelGreen-500 mb-6">
            Fuel Finder App
          </h1>
        </div>

        <Link
          to="/"
          className="mt-12 text-fuelGreen-500 flex items-center hover:text-fuelGreen-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
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
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <div className="md:hidden mb-8">
            <Link
              to="/"
              className="text-fuelGreen-500 flex items-center text-sm hover:text-fuelGreen-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
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
          </div>

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
                Resend Verification Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
