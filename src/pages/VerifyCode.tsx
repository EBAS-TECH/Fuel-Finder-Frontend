
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import PrimaryButton from "@/components/PrimaryButton";
import { useToast } from "@/components/ui/use-toast";
import VerificationInput from "@/components/auth/VerificationInput";

const VerifyCode = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerify = (code: string) => {
    if (code.length === 6) {
      setIsSubmitting(true);
      
      // Mock successful verification
      setTimeout(() => {
        toast({
          title: "Account verified!",
          description: "Your account has been verified successfully.",
        });
        
        // Redirect to login page
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }, 1500);
    }
  };

  const handleResendCode = () => {
    toast({
      title: "Verification code resent!",
      description: "Please check your email for the new code.",
    });
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
        
        <Link to="/" className="mt-12 text-fuelGreen-500 flex items-center hover:text-fuelGreen-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Landing Page
        </Link>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Mobile back button */}
          <div className="md:hidden mb-8">
            <Link to="/" className="text-fuelGreen-500 flex items-center text-sm hover:text-fuelGreen-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Landing Page
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold mb-4 text-center">Verification</h2>
          <p className="text-gray-600 mb-8 text-center">
            Enter the 6 digit code sent to your email.
          </p>
          
          <div className="mb-8">
            <div className="flex justify-center mb-8">
              <VerificationInput length={6} onComplete={handleVerify} />
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
              >
                Back to Email Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCode;
