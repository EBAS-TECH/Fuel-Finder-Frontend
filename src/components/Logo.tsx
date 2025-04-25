
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  textClassName?: string;
}

const Logo = ({ className = "", textClassName = "" }: LogoProps) => {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center">
        <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <circle cx="35" cy="35" r="34" stroke="#27C06E" strokeWidth="2" />
          <path d="M28.5 42.5C27.6716 42.5 27 41.8284 27 41V24C27 23.1716 27.6716 22.5 28.5 22.5H36.5C37.3284 22.5 38 23.1716 38 24V41C38 41.8284 37.3284 42.5 36.5 42.5H28.5Z" fill="black" />
          <rect x="29" y="24.5" width="7" height="16" rx="1" fill="white" />
          <path d="M33 39.5C33.8284 39.5 34.5 40.1716 34.5 41C34.5 41.8284 33.8284 42.5 33 42.5C32.1716 42.5 31.5 41.8284 31.5 41C31.5 40.1716 32.1716 39.5 33 39.5Z" fill="white" />
          <path d="M45.5 46.5C44.6716 46.5 44 45.8284 44 45V28C44 27.1716 44.6716 26.5 45.5 26.5H48.5C49.3284 26.5 50 27.1716 50 28V45C50 45.8284 49.3284 46.5 48.5 46.5H45.5Z" fill="#27C06E" />
          <path d="M48.25 28.75C48.25 28.0596 47.6904 27.5 47 27.5C46.3096 27.5 45.75 28.0596 45.75 28.75V29.25C45.75 29.9404 46.3096 30.5 47 30.5C47.6904 30.5 48.25 29.9404 48.25 29.25V28.75Z" fill="white" />
          <path d="M47.5 31.5C47.5 31.2239 47.7239 31 48 31H48.5C48.7761 31 49 31.2239 49 31.5V41.5C49 41.7761 48.7761 42 48.5 42H48C47.7239 42 47.5 41.7761 47.5 41.5V31.5Z" fill="white" />
          <path d="M47.5 43C47.5 42.7239 47.7239 42.5 48 42.5H48.5C48.7761 42.5 49 42.7239 49 43V43.5C49 43.7761 48.7761 44 48.5 44H48C47.7239 44 47.5 43.7761 47.5 43.5V43Z" fill="white" />
          <path d="M45.5 43C45.5 42.7239 45.7239 42.5 46 42.5H46.5C46.7761 42.5 47 42.7239 47 43V43.5C47 43.7761 46.7761 44 46.5 44H46C45.7239 44 45.5 43.7761 45.5 43.5V43Z" fill="white" />
        </svg>
        <div className={`text-xl font-semibold ${textClassName}`}>
          <span className="text-fuelBlue-500">Fuel</span>
          <span className="text-fuelGreen-500">Finder</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
