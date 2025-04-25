
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm py-4 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors">
              Home
            </Link>
            <Link to="/features" className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors">
              Features
            </Link>
            <Link to="/contact" className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors">
              Contact us
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              asChild 
              variant="outline" 
              className="text-fuelGreen-500 border-fuelGreen-500 hover:bg-fuelGreen-50"
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button 
              asChild 
              className="bg-fuelGreen-500 hover:bg-fuelGreen-600"
            >
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/" 
                className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/contact" 
                className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact us
              </Link>
              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  asChild 
                  variant="outline" 
                  className="text-fuelGreen-500 border-fuelGreen-500 hover:bg-fuelGreen-50 w-full"
                >
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-fuelGreen-500 hover:bg-fuelGreen-600 w-full"
                >
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
