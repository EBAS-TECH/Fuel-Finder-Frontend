import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PrimaryButton from "@/components/PrimaryButton";
import { useToast } from "@/components/ui/use-toast";
import VerificationInput from "@/components/auth/VerificationInput";
import { Input } from "@/components/ui/input";
import logoImage from "@/assets/newlog.png";
import { Eye, EyeOff } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<"request" | "verify" | "reset" | "success">(
    searchParams.get("user_id") ? "verify" : "request"
  );
  const user_id = searchParams.get("user_id");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send verification code");
      }

      // Update the URL with the user_id
      navigate(`/forgot-password?user_id=${data.user_id}`, { replace: true });
      setStep("verify");
      toast({
        title: "Verification code sent",
        description: `A 6-digit code has been sent to ${email}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (code: string) => {
    if (!code || code.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a complete 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!user_id) {
        throw new Error("Invalid verification request");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/auth/forgot/verify/${user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: code }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // If verification is successful, proceed to password reset
      setStep("reset");
      toast({
        title: "Success!",
        description: data.message || "Please set your new password",
      });
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!user_id) {
        throw new Error("Invalid password reset request");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/auth/new-password/${user_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setStep("success");
      toast({
        title: "Password Updated!",
        description:
          "Your password has been changed successfully. Redirecting to login...",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend code");
      }

      // Update the URL with the new user_id if needed
      navigate(`/forgot-password?user_id=${data.user_id}`, { replace: true });
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-fuelGreen-50 flex">
        {/* Left side - Logo area */}
        <div className="hidden md:flex md:w-1/2 bg-fuelGreen-50 p-8 flex-col items-center justify-center">
          <div className="flex flex-col items-center max-w-md">
            <div className="mb-12 scale-150">
              <img
                src={logoImage}
                alt="Fuel Finder Logo"
                className="h-[160px] w-[160px] rounded-full border-4 border-green-500 object-cover"
              />
            </div>
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

            <h2 className="text-3xl font-bold mb-4 text-center text-fuelBlue-500">
              Verify Your Email
            </h2>
            <p className="text-gray-600 mb-8 text-center">
              Enter the 6-digit code sent to{" "}
              {email.replace(/(.{2}).*@/, "$1****@")}
            </p>

            <div className="mb-8">
              <div className="flex justify-center mb-8">
                <VerificationInput
                  length={6}
                  onComplete={handleVerify}
                  disabled={isLoading}
                />
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={handleResendCode}
                  className="text-fuelGreen-500 hover:underline"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend Verification Code"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "reset") {
    return (
      <div className="min-h-screen bg-fuelGreen-50 flex">
        {/* Left side - Logo area */}
        <div className="hidden md:flex md:w-1/2 bg-fuelGreen-50 p-8 flex-col items-center justify-center">
          <div className="flex flex-col items-center max-w-md">
             <div className="mb-12 scale-150">
            <img
              src={logoImage}
              alt="Fuel Finder Logo"
              className="h-[160px] w-[160px] rounded-full border-4 border-green-500 object-cover"
            />
          </div>
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

            <h2 className="text-3xl font-bold mb-1 text-center text-fuelBlue-500">
              Reset Password
            </h2>
            <p className="text-gray-500 mb-6 text-center">
              Enter your new password below
            </p>

            <form onSubmit={handlePasswordReset}>
              <div className="mb-4 relative">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500 pr-10"
                    placeholder="Enter your new password"
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-6 relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password *
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500 pr-10"
                    placeholder="Confirm your new password"
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <PrimaryButton
                type="submit"
                className="w-full py-6 font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </PrimaryButton>
            </form>

            <p className="text-center mt-6 text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-fuelGreen-500 hover:underline font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-fuelGreen-50 flex">
        {/* Left side - Logo area */}
        <div className="hidden md:flex md:w-1/2 bg-fuelGreen-50 p-8 flex-col items-center justify-center">
          <div className="flex flex-col items-center max-w-md">
              <div className="mb-12 scale-150">
            <img
              src={logoImage}
              alt="Fuel Finder Logo"
              className="h-[160px] w-[160px] rounded-full border-4 border-green-500 object-cover"
            />
          </div>
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

        {/* Right side - Message */}
        <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center">
          <div className="w-full max-w-md text-center">
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

            <div className="mb-6">
              <svg
                className="w-16 h-16 text-fuelGreen-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-3xl font-bold mb-4 text-center text-fuelBlue-500">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-8">
              Your password has been successfully updated. You will be
              automatically redirected to the login page.
            </p>

            <div className="mt-8">
              <Link
                to="/login"
                className="text-fuelGreen-500 hover:underline font-medium flex items-center justify-center"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Initial email request form
  return (
    <div className="min-h-screen bg-fuelGreen-50 flex">
      {/* Left side - Logo area */}
      <div className="hidden md:flex md:w-1/2 bg-fuelGreen-50 p-8 flex-col items-center justify-center">
        <div className="flex flex-col items-center max-w-md">
             <div className="mb-12 scale-150">
            <img
              src={logoImage}
              alt="Fuel Finder Logo"
              className="h-[160px] w-[160px] rounded-full border-4 border-green-500 object-cover"
            />
          </div>
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

          <h2 className="text-3xl font-bold mb-1 text-center text-fuelBlue-500">
            Forgot Password
          </h2>
          <p className="text-gray-500 mb-6 text-center">
            Enter your email to receive a verification code
          </p>

          <form onSubmit={handleEmailSubmit}>
            <div className="mb-6">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                placeholder="Enter your email address"
                required
                disabled={isLoading}
              />
            </div>

            <PrimaryButton
              type="submit"
              className="w-full py-6 font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </PrimaryButton>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-fuelGreen-500 hover:underline font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
