import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star, Mail, Phone, MapPin, Hexagon, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data for station details
const stationData = {
  id: 1,
  name: "Total Energies around Mexico Square",
  email: "toalct123@gmail.com",
  phone: "123456789",
  address: "Around Mexico Sq.",
  coordinates: {
    latitude: 9.017949,
    longitude: 38.775590
  },
  username: "totalenergies123",
  rating: 3.0,
  logo: "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png"
};

// Sample feedback data
const feedbackData = [
  {
    id: 1,
    reviewer: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 5,
    comment: "I was running on empty during a fuel shortage — this app helped me find a nearby station in minutes. Total lifesaver!"
  },
  {
    id: 2,
    reviewer: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 4,
    comment: "I was running on empty during a fuel shortage — this app helped me find a nearby station in minutes. Total lifesaver!"
  },
  {
    id: 3,
    reviewer: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 2,
    comment: "I was running on empty during a fuel shortage — this app helped me find a nearby station in minutes. Total lifesaver!"
  }
];

// Sample fuel availability data
const fuelAvailabilityData = [
  {
    id: 1,
    fuelName: "Diesel",
    startDate: "22 Jan 2024",
    endDate: "29 Jan 2024",
    availableQty: "9"
  },
  {
    id: 2,
    fuelName: "Gasoline",
    startDate: "22 Jan 2024",
    endDate: "29 Jan 2024",
    availableQty: "6.5"
  }
];

export default function StationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("stars");
  
  // Render star ratings
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        className={`h-5 w-5 ${index < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} 
      />
    ));
  };

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <Store className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Stations</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Stations management</p>
      </div>
      
      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <Link to="/admin/stations" className="flex items-center text-emerald-600 mb-5 hover:underline">
          <ChevronLeft className="h-5 w-5 mr-2" />
          <span>Station's Detail</span>
        </Link>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Station Info Section */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4 bg-gray-100">
                <img 
                  src={stationData.logo}
                  alt={stationData.name}
                  className="w-20 h-20 object-contain"
                />
              </div>
              
              <h2 className="text-xl font-medium text-center mb-1">{stationData.name}</h2>
              <div className="flex items-center gap-1 mb-4">
                {renderStars(Math.floor(stationData.rating))}
                <span className="text-gray-400 ml-1">{stationData.rating.toFixed(1)}</span>
              </div>
              
              <div className="w-full space-y-3">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-emerald-600">{stationData.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p>{stationData.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p>{stationData.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Hexagon className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p>{stationData.coordinates.latitude}, {stationData.coordinates.longitude}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fuel Availability Report */}
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Fuel Availability Report</h3>
              
              <div className="flex justify-end mb-2">
                <Button variant="outline" className="bg-emerald-500 text-white hover:bg-emerald-600 border-none text-xs py-1 h-8">
                  Generate Report
                </Button>
              </div>
              
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-500 text-white text-left">
                    <th className="py-2 px-3 rounded-tl-lg">ID</th>
                    <th className="py-2 px-3">Fuel Name</th>
                    <th className="py-2 px-3">Start Date</th>
                    <th className="py-2 px-3">End Date</th>
                    <th className="py-2 px-3 rounded-tr-lg text-center">Available (sq)</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelAvailabilityData.map((item) => (
                    <tr key={item.id} className="border-b last:border-b-0">
                      <td className="py-3 px-3">{item.id}</td>
                      <td className="py-3 px-3">{item.fuelName}</td>
                      <td className="py-3 px-3">{item.startDate}</td>
                      <td className="py-3 px-3">{item.endDate}</td>
                      <td className="py-3 px-3 text-center">{item.availableQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-500">
                  Showing 1 - 6 of 2
                </div>
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
          
          {/* Feedback Section */}
          <div className="col-span-12 lg:col-span-7">
            <div className="bg-white rounded-lg p-6 h-full">
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
                            src="/lovable-uploads/33aaae15-01dd-4225-9aea-5e05b6b69803.png"
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
                    <p className="text-sm text-gray-500">{feedback.comment}</p>
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
