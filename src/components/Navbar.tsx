
import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offsetTop = element.offsetTop - 80; // Adjust for navbar height
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-4 md:px-8 ${
        scrolled ? "bg-white/95 backdrop-blur-sm shadow-md" : "bg-white"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <Logo />
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            <button 
              onClick={() => scrollToSection('home')}
              className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors font-medium"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors font-medium"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors font-medium"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors font-medium"
            >
              Contact us
            </button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button 
              asChild 
              variant="outline" 
              className="text-fuelGreen-500 border-fuelGreen-500 hover:bg-fuelGreen-50 font-medium"
            >
              <Link to="/login">Login</Link>
            </Button>
            <Button 
              asChild 
              className="bg-fuelGreen-500 hover:bg-fuelGreen-600 font-medium"
            >
              <Link to="/register">Register</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t animate-fade-in">
            <nav className="flex flex-col gap-4">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors px-2 py-2 font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors px-2 py-2 font-medium"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors px-2 py-2 font-medium"
              >
                Pricing
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-fuelBlue-500 hover:text-fuelGreen-500 transition-colors px-2 py-2 font-medium"
              >
                Contact us
              </button>
              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  asChild 
                  variant="outline" 
                  className="text-fuelGreen-500 border-fuelGreen-500 hover:bg-fuelGreen-50 w-full font-medium"
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-fuelGreen-500 hover:bg-fuelGreen-600 w-full font-medium"
                >
                  <Link to="/register">Register</Link>
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
