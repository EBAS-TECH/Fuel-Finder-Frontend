import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "@/components/Logo";
import PrimaryButton from "@/components/PrimaryButton";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "", // Changed from usernameEmail to username
    password: "",
    keepLoggedIn: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      toast({
        title: "Login successful!",
        description: "Welcome to Fuel Finder.",
      });

      // Store token if keepLoggedIn is true
      if (formData.keepLoggedIn && data.token) {
        localStorage.setItem("authToken", data.token);
      } else if (data.token) {
        sessionStorage.setItem("authToken", data.token);
      }

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/gasstation");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

          <h2 className="text-3xl font-bold mb-1 text-center text-fuelBlue-500">
            Login
          </h2>
          <p className="text-gray-500 mb-6 text-center">
            Enter your username and password to login
          </p>

          {/* Google Sign In Button */}
          <Button
            variant="outline"
            className="w-full mb-6 flex items-center justify-center gap-2 py-6 bg-fuelGreen-50 hover:bg-fuelGreen-100"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.6 10.2273C19.6 9.51823 19.5364 8.84549 19.4182 8.18185H10V12.0546H15.3818C15.15 13.3 14.4455 14.3591 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2728 19.6 10.2273Z"
                fill="#4285F4"
              />
              <path
                d="M10 20.0001C12.7 20.0001 14.9636 19.1046 16.6182 17.5773L13.3864 15.0682C12.4909 15.6682 11.3455 16.0228 10 16.0228C7.39545 16.0228 5.19091 14.2637 4.40455 11.9001H1.06364V14.4909C2.70909 17.7591 6.09091 20.0001 10 20.0001Z"
                fill="#34A853"
              />
              <path
                d="M4.40455 11.8999C4.20455 11.2999 4.09091 10.6636 4.09091 9.99994C4.09091 9.33631 4.20455 8.69994 4.40455 8.09994V5.50903H1.06364C0.386364 6.85903 0 8.38631 0 9.99994C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.8999Z"
                fill="#FBBC05"
              />
              <path
                d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.7 0 10 0C6.09091 0 2.70909 2.24091 1.06364 5.50909L4.40455 8.1C5.19091 5.73636 7.39545 3.97727 10 3.97727Z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                  placeholder="Enter your password"
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

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  name="keepLoggedIn"
                  checked={formData.keepLoggedIn}
                  onChange={handleChange}
                  className="h-4 w-4 text-fuelGreen-500 focus:ring-fuelGreen-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="keepLoggedIn"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Keep me logged in
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-fuelGreen-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <PrimaryButton type="submit" className="w-full py-6 font-medium">
              Login
            </PrimaryButton>

            <p className="text-center mt-6 text-gray-600">
              Not registered yet?{" "}
              <Link
                to="/register"
                className="text-fuelGreen-500 hover:underline font-medium"
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
