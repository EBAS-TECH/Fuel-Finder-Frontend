
import { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import PrimaryButton from "@/components/PrimaryButton";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type UserType = 'drivers' | 'stations';

const Register = () => {
  const { toast } = useToast();
  const [userType, setUserType] = useState<UserType>('drivers');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    tinNumber: '',
    stationName: '',
    stationLatitude: '',
    stationLongitude: '',
    stationAddress: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }
    
    // Redirect to email verification
    window.location.href = '/verify-email';
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
          
          <h2 className="text-3xl font-bold mb-1 text-center text-fuelBlue-500">Create Account</h2>
          <p className="text-gray-500 mb-6 text-center">Enter your email and create a password to sign up!</p>
          
          <div className="mb-6">
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`w-1/2 py-2 font-medium text-sm ${
                  userType === 'drivers' 
                    ? 'bg-fuelGreen-500 text-white border-b-2 border-fuelGreen-500' 
                    : 'bg-white text-gray-500 hover:bg-fuelGreen-50'
                }`}
                onClick={() => setUserType('drivers')}
              >
                Drivers
              </button>
              <button
                className={`w-1/2 py-2 font-medium text-sm ${
                  userType === 'stations' 
                    ? 'bg-fuelGreen-500 text-white border-b-2 border-fuelGreen-500' 
                    : 'bg-white text-gray-500 hover:bg-fuelGreen-50'
                }`}
                onClick={() => setUserType('stations')}
              >
                Gas Station
              </button>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <Button 
            variant="outline" 
            className="w-full mb-6 flex items-center justify-center gap-2 py-6 bg-fuelGreen-50 hover:bg-fuelGreen-100"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.6 10.2273C19.6 9.51823 19.5364 8.84549 19.4182 8.18185H10V12.0546H15.3818C15.15 13.3 14.4455 14.3591 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2728 19.6 10.2273Z" fill="#4285F4"/>
              <path d="M10 20.0001C12.7 20.0001 14.9636 19.1046 16.6182 17.5773L13.3864 15.0682C12.4909 15.6682 11.3455 16.0228 10 16.0228C7.39545 16.0228 5.19091 14.2637 4.40455 11.9001H1.06364V14.4909C2.70909 17.7591 6.09091 20.0001 10 20.0001Z" fill="#34A853"/>
              <path d="M4.40455 11.8999C4.20455 11.2999 4.09091 10.6636 4.09091 9.99994C4.09091 9.33631 4.20455 8.69994 4.40455 8.09994V5.50903H1.06364C0.386364 6.85903 0 8.38631 0 9.99994C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.8999Z" fill="#FBBC05"/>
              <path d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.7 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Button>
          
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {userType === 'drivers' ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username*</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <label htmlFor="tinNumber" className="block text-sm font-medium text-gray-700 mb-1">TIN Number*</label>
                  <div className="flex">
                    <input
                      type="text"
                      id="tinNumber"
                      name="tinNumber"
                      value={formData.tinNumber}
                      onChange={handleChange}
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                      placeholder="Enter tin number"
                      required
                    />
                    <button 
                      type="button"
                      className="bg-gray-100 border border-gray-300 rounded-r-md px-3 hover:bg-gray-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="stationName" className="block text-sm font-medium text-gray-700 mb-1">Station Name*</label>
                  <input
                    type="text"
                    id="stationName"
                    name="stationName"
                    value={formData.stationName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="Enter your station name"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="stationName" className="block text-sm font-medium text-gray-700 mb-1">Station Name*</label>
                  <input
                    type="text"
                    id="stationName"
                    name="stationName"
                    value={formData.stationName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="Enter your station name"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="stationLatitude" className="block text-sm font-medium text-gray-700 mb-1">Station Latitude*</label>
                  <input
                    type="text"
                    id="stationLatitude"
                    name="stationLatitude"
                    value={formData.stationLatitude}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="Enter your station's latitude"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="stationLongitude" className="block text-sm font-medium text-gray-700 mb-1">Station Longitude*</label>
                  <input
                    type="text"
                    id="stationLongitude"
                    name="stationLongitude"
                    value={formData.stationLongitude}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="Enter your station's longitude"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="stationAddress" className="block text-sm font-medium text-gray-700 mb-1">Station Address*</label>
                  <input
                    type="text"
                    id="stationAddress"
                    name="stationAddress"
                    value={formData.stationAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="Enter your station's latitude"
                    required
                  />
                </div>
              </>
            )}
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                  placeholder="Min. 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            
            <PrimaryButton type="submit" className="w-full py-6 font-medium">
              Register
            </PrimaryButton>
            
            <p className="text-center mt-6 text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-fuelGreen-500 hover:underline font-medium">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
