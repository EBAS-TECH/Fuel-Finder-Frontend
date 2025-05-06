import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star, User } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data for driver details
const driverData = {
  id: 1,
  firstName: "Solomon",
  lastName: "Bekele",
  username: "solbek123",
  email: "email123@gmail.com",
  avatar: "/lovable-uploads/33aaae15-01dd-4225-9aea-5e05b6b69803.png"
};

// Sample feedback data
const feedbackData = [
  {
    id: 1,
    reviewer: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 5,
    comment: "I was running on empty during a fuel shortage — this app helped me find a nearby station in minutes. Total lifesaver!",
    stationName: "Total Energies Near abc St.",
    stationLogo: "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png",
    stationRating: 4.4
  },
  {
    id: 2,
    reviewer: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 4,
    comment: "I was running on empty during a fuel shortage — this app helped me find a nearby station in minutes. Total lifesaver!",
    stationName: "Yetebaberut around abc St.",
    stationLogo: "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png",
    stationRating: 4
  },
  {
    id: 3,
    reviewer: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 2,
    comment: "I was running on empty during a fuel shortage — this app helped me find a nearby station in minutes. Total lifesaver!",
    stationName: "OLA Fuel Station around abc St.",
    stationLogo: "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png",
    stationRating: 4.4
  }
];

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("stars");
  
  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Render star ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`h-5 w-5 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} 
      />
    ));
  };

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <User className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Drivers</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Drivers management</p>
      </div>
      
      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <Link to="/admin/drivers" className="flex items-center text-emerald-600 mb-5 hover:underline">
          <ChevronLeft className="h-5 w-5 mr-2" />
          <span>Driver's Detail</span>
        </Link>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Driver Profile Card */}
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-lg flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-emerald-100 mb-5 overflow-hidden">
              <img 
                src={driverData.avatar} 
                alt={`${driverData.firstName} ${driverData.lastName}`}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-medium mb-1">{`${driverData.firstName} ${driverData.lastName}`}</h3>
            <p className="text-gray-500 mb-1">{driverData.username}</p>
            <p className="text-gray-500">{driverData.email}</p>
          </div>
          
          {/* Feedback Section */}
          <div className="col-span-12 md:col-span-8">
            <div className="bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium">Feedbacks</h3>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-32 border-none bg-gray-100">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stars">Stars</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="date">
                    <SelectTrigger className="w-32 border-none bg-gray-100">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                {feedbackData.map((feedback) => (
                  <div key={feedback.id} className="border-l-4 border-emerald-500 pl-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img 
                            src={driverData.avatar} 
                            alt={feedback.reviewer}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-emerald-700">{feedback.reviewer}</h4>
                          <p className="text-xs text-gray-400">{feedback.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {renderStars(feedback.rating)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{feedback.comment}</p>
                    
                    <div className="flex justify-end items-center gap-3 bg-gray-50 p-2 rounded-lg">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={feedback.stationLogo}
                          alt={feedback.stationName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium">{feedback.stationName}</h5>
                        <div className="flex items-center gap-1">
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-md flex items-center">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-0.5" />
                            {feedback.stationRating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-1">
                  <button 
                    className="p-1.5 rounded-full bg-gray-200 text-gray-600" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {[1, 2].map((page) => (
                    <button 
                      key={page}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentPage === page 
                          ? "bg-emerald-500 text-white" 
                          : "bg-gray-200 text-gray-600"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button 
                    className="p-1.5 rounded-full bg-gray-200 text-gray-600" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === 2}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import the ChevronRight icon
import { ChevronRight } from "lucide-react";
