import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PrimaryButton from "@/components/PrimaryButton";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import logoImage from "@/assets/newlog.png";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
type UserType = "drivers" | "stations";

interface StationValidationResponse {
  first_name?: string;
  last_name?: string;
}

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>("stations");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validatingTin, setValidatingTin] = useState(false);
  const [tinValidated, setTinValidated] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    tinNumber: "",
    stationName: "",
    amharicName: "",
    stationLatitude: "",
    stationLongitude: "",
    stationAddress: "",
    password: "",
    email: "",
    confirmPassword: "",
  });

  const [autoFilledFields, setAutoFilledFields] = useState<
    Record<string, boolean>
  >({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    message: string;
  }>({ score: 0, message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Check password strength when password field changes
    if (name === "password") {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password: string) => {
    // Reset if empty
    if (!password) {
      setPasswordStrength({ score: 0, message: "" });
      return;
    }

    // Initialize variables
    let score = 0;
    let messages: string[] = [];

    // Check length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Check for uppercase letters
    if (/[A-Z]/.test(password)) score++;
    else messages.push("at least one uppercase letter");

    // Check for lowercase letters
    if (/[a-z]/.test(password)) score++;
    else messages.push("at least one lowercase letter");

    // Check for numbers
    if (/\d/.test(password)) score++;
    else messages.push("at least one number");

    // Check for special characters
    if (/[^A-Za-z0-9]/.test(password)) score++;
    else messages.push("at least one special character");

    // Determine strength message
    let message = "";
    if (score >= 5) message = "Strong password";
    else if (score >= 3) message = "Medium password";
    else if (score > 0) message = "Weak password";
    else message = "Very weak password";

    if (messages.length > 0 && score < 5) {
      message += ` - needs ${messages.join(", ")}`;
    }

    setPasswordStrength({ score, message });
  };

  const validateTinNumber = async () => {
    if (!formData.tinNumber) {
      toast({
        title: "Validation Error",
        description: "Please enter a TIN number",
        variant: "destructive",
      });
      return;
    }

    setValidatingTin(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/station/validate-tin/${formData.tinNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Invalid TIN number or station not registered with ministry"
        );
      }

      const data: StationValidationResponse = await response.json();

      const filledFields: Record<string, boolean> = {};
      const updatedFormData = { ...formData };

      // Auto-fill first_name and last_name from backend response
      if (data.first_name) {
        updatedFormData.firstName = data.first_name;
        filledFields.firstName = true;
      }
      if (data.last_name) {
        updatedFormData.lastName = data.last_name;
        filledFields.lastName = true;
      }

      setFormData(updatedFormData);
      setAutoFilledFields(filledFields);
      setTinValidated(true);

      toast({
        title: "TIN Validated",
        description:
          "Station information retrieved. Please complete the registration form.",
      });
    } catch (error: any) {
      toast({
        title: "Validation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setValidatingTin(false);
    }
  };

  const isFieldDisabled = (fieldName: string) => {
    if (userType !== "stations") return false;
    if (!tinValidated) return true; // Disable all fields until TIN validated
    return autoFilledFields[fieldName]; // Disable only auto-filled fields
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Password strength validation
    if (passwordStrength.score < 3) {
      toast({
        title: "Weak Password",
        description:
          "Please choose a stronger password. " + passwordStrength.message,
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      let response, data;
      let userId: string;

      if (userType === "drivers") {
        const driverData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          password: formData.password,
          email: formData.email,
          role: "DRIVER",
        };

        response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(driverData),
        });

        data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            throw new Error("Username or email already exists");
          }
          throw new Error(data.message || "Driver registration failed");
        }

        userId = data.data.id;
        if (!userId) {
          throw new Error("User ID not found in driver response");
        }
      } else {
        if (!tinValidated) {
          throw new Error("Please validate your TIN number first");
        }

        const stationData = {
          user: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.username,
            password: formData.password,
            email: formData.email,
            role: "GAS_STATION",
          },
          en_name: formData.stationName,
          am_name: formData.amharicName || null,
          tin_number: formData.tinNumber,
          latitude: parseFloat(formData.stationLatitude),
          longitude: parseFloat(formData.stationLongitude),
          address: formData.stationAddress,
        };

        response = await fetch(`${API_BASE_URL}/api/station`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(stationData),
        });

        data = await response.json();

        if (!response.ok) {
          if (response.status === 409) {
            throw new Error("Username or email already exists");
          }
          throw new Error(data.message || "Station registration failed");
        }

        userId = data.data?.user?.id;
        if (!userId) {
          throw new Error("User ID not found in station response");
        }
      }

      localStorage.setItem("tempUserEmail", formData.email);
      localStorage.setItem("tempUserId", userId);

      toast({
        title: "Registration successful!",
        description: "Please verify your email to continue",
      });

      navigate("/verify-code");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleUserTypeChange = (type: UserType) => {
    setUserType(type);
    setTinValidated(false);
    setAutoFilledFields({});
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      tinNumber: "",
      stationName: "",
      amharicName: "",
      stationLatitude: "",
      stationLongitude: "",
      stationAddress: "",
      password: "",
      email: "",
      confirmPassword: "",
    });
    setPasswordStrength({ score: 0, message: "" });
  };

  // Password strength color indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength.score >= 5) return "bg-green-500";
    if (passwordStrength.score >= 3) return "bg-yellow-500";
    if (passwordStrength.score > 0) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="min-h-screen bg-fuelGreen-50 flex">
      {/* Left side - Fixed Logo area */}
      <div className="hidden md:flex md:w-1/2 bg-fuelGreen-50 p-8 flex-col items-center justify-center sticky top-0 h-screen">
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

      {/* Right side - Scrollable Form */}
      <div className="w-full md:w-1/2 bg-white p-8 flex items-center justify-center overflow-y-auto">
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
            Create Account
          </h2>
          <p className="text-gray-500 mb-6 text-center">
            Enter your email and create a password to sign up!
          </p>

          <div className="mb-6">
            <div className="flex border rounded-lg overflow-hidden">
              <button
                className={`w-1/2 py-2 font-medium text-sm ${
                  userType === "stations"
                    ? "bg-fuelGreen-500 text-white border-b-2 border-fuelGreen-500"
                    : "bg-white text-gray-500 hover:bg-fuelGreen-50"
                }`}
                onClick={() => handleUserTypeChange("stations")}
              >
                Gas Station
              </button>
              <button
                className={`w-1/2 py-2 font-medium text-sm ${
                  userType === "drivers"
                    ? "bg-fuelGreen-500 text-white border-b-2 border-fuelGreen-500"
                    : "bg-white text-gray-500 hover:bg-fuelGreen-50"
                }`}
                onClick={() => handleUserTypeChange("drivers")}
              >
                Drivers
              </button>
            </div>
          </div>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit}>
            {userType === "drivers" ? (
              <>
                {/* Driver form remains exactly the same */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username*
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="johndoe123"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                {/* Modified gas station form with TIN validation */}
                {/* TIN Number Field - Always first and editable */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    TIN Number (10 digits)*
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="tinNumber"
                      value={formData.tinNumber}
                      onChange={handleChange}
                      pattern="\d{10}"
                      title="10 digit TIN number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                      placeholder="1234567890"
                      required
                      disabled={tinValidated || validatingTin || isLoading}
                    />
                    {!tinValidated && (
                      <Button
                        type="button"
                        onClick={validateTinNumber}
                        disabled={validatingTin || isLoading}
                        className="bg-fuelGreen-500 hover:bg-fuelGreen-600"
                      >
                        {validatingTin ? "Validating..." : "Validate"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Personal Info Fields - Will be auto-filled from backend */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        isFieldDisabled("firstName")
                          ? "bg-gray-100 border-gray-200 text-gray-600 focus:ring-gray-300"
                          : "border-gray-300 focus:ring-fuelGreen-500"
                      }`}
                      placeholder="Manager's first name"
                      required
                      disabled={isLoading || isFieldDisabled("firstName")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        isFieldDisabled("lastName")
                          ? "bg-gray-100 border-gray-200 text-gray-600 focus:ring-gray-300"
                          : "border-gray-300 focus:ring-fuelGreen-500"
                      }`}
                      placeholder="Manager's last name"
                      required
                      disabled={isLoading || isFieldDisabled("lastName")}
                    />
                  </div>
                </div>

                {/* Other fields that user needs to fill */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username*
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="station_username"
                    required
                    disabled={isLoading || !tinValidated}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="station@example.com"
                    required
                    disabled={isLoading || !tinValidated}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station Name (English)*
                  </label>
                  <input
                    type="text"
                    name="stationName"
                    value={formData.stationName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="City Gas Station"
                    required
                    disabled={isLoading || !tinValidated}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Station Name (Amharic)
                  </label>
                  <input
                    type="text"
                    name="amharicName"
                    value={formData.amharicName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="የከተማ ጋዝ ጣቢያ"
                    disabled={isLoading || !tinValidated}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude*
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="stationLatitude"
                      value={formData.stationLatitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                      placeholder="9.1234"
                      required
                      disabled={isLoading || !tinValidated}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude*
                    </label>
                    <input
                      type="number"
                      step="any"
                      name="stationLongitude"
                      value={formData.stationLongitude}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                      placeholder="38.5678"
                      required
                      disabled={isLoading || !tinValidated}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address*
                  </label>
                  <input
                    type="text"
                    name="stationAddress"
                    value={formData.stationAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                    placeholder="123 Main St, Addis Ababa"
                    required
                    disabled={isLoading || !tinValidated}
                  />
                </div>
              </>
            )}

            {/* Password fields - Only enabled after TIN validation for stations */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  disabled={
                    isLoading || (userType === "stations" && !tinValidated)
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={togglePasswordVisibility}
                  disabled={
                    isLoading || (userType === "stations" && !tinValidated)
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getPasswordStrengthColor()}`}
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p
                    className={`text-xs mt-1 ${
                      passwordStrength.score >= 5
                        ? "text-green-600"
                        : passwordStrength.score >= 3
                        ? "text-yellow-600"
                        : passwordStrength.score > 0
                        ? "text-orange-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordStrength.message}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password*
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fuelGreen-500"
                  placeholder="Confirm your password"
                  minLength={8}
                  required
                  disabled={
                    isLoading || (userType === "stations" && !tinValidated)
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={
                    isLoading || (userType === "stations" && !tinValidated)
                  }
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
              disabled={
                isLoading ||
                (userType === "stations" && !tinValidated) ||
                passwordStrength.score < 3
              }
            >
              {isLoading ? "Registering..." : "Register"}
            </PrimaryButton>

            <p className="text-center mt-6 text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-fuelGreen-500 hover:underline font-medium"
              >
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
