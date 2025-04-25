
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import PrimaryButton from "@/components/PrimaryButton";
import { useToast } from "@/components/ui/use-toast";

const VerifyEmail = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock successful verification code sent
    toast({
      title: "Verification code sent!",
      description: "Please check your email for the verification code.",
    });
    
    // Redirect to verification code page
    setTimeout(() => {
      window.location.href = '/verify-code';
    }, 1500);
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
          
          <h2 className="text-3xl font-bold mb-4 text-center">Email</h2>
          <p className="text-gray-600 mb-8 text-center">
            Enter your email for us to send you a verification code.
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                placeholder="Your email"
                required
              />
            </div>
            
            <PrimaryButton type="submit" className="w-full py-6 font-medium">
              Verify Email
            </PrimaryButton>
            
            <div className="text-center mt-6">
              <Link to="/register" className="text-fuelGreen-500 hover:underline">
                Back to Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
