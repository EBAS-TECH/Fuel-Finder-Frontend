import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronLeft, Star, Mail, Phone, MapPin, Globe, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Sample data for station details
const stationData = {
  id: 1,
  name: "Total Energies around Mexico Square",
  amharicName: "ቶታል ኢነርጂስ አራውንድ መክሲኮ አደባባይ",
  email: "email123@gmail.com",
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
    availableQty: "11"
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
  const [filter, setFilter] = useState("Stars");
  const [sort, setSort] = useState("Date");
  const [fuelType, setFuelType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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

  // Status change handler
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-green-500">
          <svg className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 3v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-xl font-medium">Stations</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Stations management</p>
      </div>
      
      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <Link to="/admin/stations" className="flex items-center text-green-500 mb-5 hover:underline">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Station's Detail</span>
        </Link>
        
        {/* Top section with station info and feedbacks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Station info card */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
              <div className="w-24 h-24 rounded-full overflow-hidden p-2 border flex items-center justify-center mb-3">
                <img 
                  src={stationData.logo} 
                  alt={stationData.name}
                  className="w-20 h-20 object-contain" 
                />
              </div>
              
              <h2 className="text-lg font-medium text-center mb-1">{stationData.name}</h2>
              <p className="text-center text-sm text-gray-500 mb-3">{stationData.amharicName}</p>
              
              <div className="flex items-center mb-5">
                {renderStars(Math.floor(stationData.rating))}
                <span className="ml-2">{stationData.rating.toFixed(1)}</span>
              </div>
              
              <div className="w-full space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-sm">{stationData.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-sm">{stationData.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-sm">{stationData.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="text-sm">{stationData.username}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Coordinates</p>
                    <p className="text-sm">{stationData.coordinates.latitude.toFixed(6)}, {stationData.coordinates.longitude.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feedback section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm h-full relative">
              {/* Status button at the top */}
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className={`px-4 py-1 rounded-full text-white text-sm ${
                    status === "Pending" ? "bg-yellow-500 hover:bg-yellow-600" : 
                    status === "Approved" ? "bg-green-500 hover:bg-green-600" : 
                    "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {status}
                </Button>
              </div>
              
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-medium">Feedbacks</h3>
                <div className="flex gap-2">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-28 border border-gray-200 text-sm">
                      <SelectValue placeholder="Stars" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stars">Stars</SelectItem>
                      <SelectItem value="Newest">Newest</SelectItem>
                      <SelectItem value="Oldest">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-28 border border-gray-200 text-sm">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Date">Date</SelectItem>
                      <SelectItem value="Rating">Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-6">
                {feedbackData.slice(0, 3).map((feedback) => (
                  <div key={feedback.id} className="border-l-4 border-green-500 pl-4 mb-4">
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
                          <h4 className="font-medium text-green-700">{feedback.reviewer}</h4>
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
              
              <div className="flex items-center justify-between mt-4">
                <div></div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageChange(currentPage - 1);
                        }}
                        className={currentPage === 1 ? "opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {[1, 2].map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                          className={
                            currentPage === page 
                              ? "bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center" 
                              : "bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center"
                          }
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < 2) handlePageChange(currentPage + 1);
                        }}
                        className={currentPage === 2 ? "opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom section with fuel availability */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Fuel Availability Report</h3>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="w-32 border border-gray-200">
                <SelectValue placeholder="Fuel Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="gasoline">Gasoline</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={startDate} onValueChange={setStartDate}>
              <SelectTrigger className="w-32 border border-gray-200">
                <SelectValue placeholder="Start Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="22-jan-2024">22 Jan 2024</SelectItem>
                <SelectItem value="23-jan-2024">23 Jan 2024</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={endDate} onValueChange={setEndDate}>
              <SelectTrigger className="w-32 border border-gray-200">
                <SelectValue placeholder="End Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="29-jan-2024">29 Jan 2024</SelectItem>
                <SelectItem value="30-jan-2024">30 Jan 2024</SelectItem>
              </SelectContent>
            </Select>
            
            <Button className="bg-green-500 hover:bg-green-600 text-white px-4">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <Table className="w-full border border-gray-100">
            <TableHeader>
              <TableRow>
                <TableHead className="bg-green-500 text-white font-normal w-16">ID</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Fuel Name</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">Start Date</TableHead>
                <TableHead className="bg-green-500 text-white font-normal">End Date</TableHead>
                <TableHead className="bg-green-500 text-white font-normal text-center">Available hrs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fuelAvailabilityData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.fuelName}</TableCell>
                  <TableCell>{item.startDate}</TableCell>
                  <TableCell>{item.endDate}</TableCell>
                  <TableCell className="text-center">{item.availableQty}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>3</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing 1 - 5 of 2
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={`p-1.5 rounded-full ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
                    disabled={currentPage === 1} 
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(1)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    1
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button
                    onClick={() => handlePageChange(2)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                  >
                    2
                  </button>
                </PaginationItem>
                <PaginationItem>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={`p-1.5 rounded-full ${currentPage === 2 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-600'}`}
                    disabled={currentPage === 2}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Station Status</DialogTitle>
            <DialogDescription>
              Select the new status for this station.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <Button 
                onClick={() => handleStatusChange("Pending")} 
                className={`w-full ${status === "Pending" ? 'bg-yellow-500 text-white' : 'bg-gray-100 hover:bg-yellow-500 hover:text-white'}`}
              >
                Pending
              </Button>
              <Button 
                onClick={() => handleStatusChange("Approved")} 
                className={`w-full ${status === "Approved" ? 'bg-green-500 text-white' : 'bg-gray-100 hover:bg-green-500 hover:text-white'}`}
              >
                Approved
              </Button>
              <Button 
                onClick={() => handleStatusChange("Rejected")} 
                className={`w-full ${status === "Rejected" ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-red-500 hover:text-white'}`}
              >
                Rejected
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
