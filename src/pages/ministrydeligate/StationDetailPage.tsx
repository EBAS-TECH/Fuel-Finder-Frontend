import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

const DelegateStationDetailPage = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStars, setSelectedStars] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  // Dummy data for feedback
  const feedbackData = [
    {
      id: 1,
      name: "Samuel Terefe",
      date: "22 Jan 2025",
      rating: 5,
      comment: "I was running on empty during a fuel shortage – this app helped me find a nearby station in minutes. Total lifesaver!"
    },
    {
      id: 2,
      name: "Samuel Terefe",
      date: "22 Jan 2025",
      rating: 4,
      comment: "I was running on empty during a fuel shortage – this app helped me find a nearby station in minutes. Total lifesaver!"
    },
    {
      id: 3,
      name: "Samuel Terefe",
      date: "22 Jan 2025",
      rating: 2,
      comment: "I was running on empty during a fuel shortage – this app helped me find a nearby station in minutes. Total lifesaver!"
    }
  ];

  const availabilityData = [
    {
      id: 1,
      fuelName: "Diesel",
      startDate: "22 Jan 2024",
      endDate: "29 Jan 2024",
      availableHrs: 11
    },
    {
      id: 2,
      fuelName: "Gasoline",
      startDate: "22 Jan 2024",
      endDate: "29 Jan 2024",
      availableHrs: 6.5
    }
  ];

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`text-yellow-400 ${i <= rating ? "fill-current" : "text-gray-300"}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="bg-[#F7F9F9] min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Stations</h1>
        <p className="text-sm text-gray-500">View Station Report</p>
      </div>

      <div className="mb-4">
        <Button 
          variant="ghost" 
          className="text-green-500 pl-0 flex items-center" 
          onClick={() => navigate(-1)}
        >
          <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5m7 7l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Station's Detail
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Station Information Card */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-[#F2FCE2] p-1 mb-4">
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white">
                <img 
                  src="/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png" 
                  alt="Total Energies" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h2 className="text-xl font-bold text-center">Total Energies around Mexico Square</h2>
            <p className="text-center text-gray-500 mt-1">ቶታል ኢነርጂስ አካባቢ ሜክሲኮ አደባባይ</p>
            
            <div className="flex justify-center mt-4">
              {renderStars(3)}
              <span className="ml-2 text-gray-700">3.0</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tin Number</p>
                <p className="font-medium">1234567890</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14.121 13.121A3 3 0 1012 7.343" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium">Around Mexico Sq.</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Latitude</p>
                <p className="font-medium">9.03420</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Longitude</p>
                <p className="font-medium">38.73840</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Feedbacks</h3>
              
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white border text-gray-700">
                  Stars
                  <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
                
                <Button variant="outline" className="bg-white border text-gray-700">
                  Date
                  <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {feedbackData.map((feedback) => (
                <div key={feedback.id} className="border-l-4 border-green-500 pl-4">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                        <img 
                          src="/lovable-uploads/86065143-bd67-4268-aa7e-f5d5b4fac7e6.png" 
                          alt={feedback.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{feedback.name}</p>
                        <p className="text-xs text-gray-500">{feedback.date}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {renderStars(feedback.rating)}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{feedback.comment}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationLink disabled className="cursor-not-allowed">
                      &lt;
                    </PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink className="bg-green-500 text-white">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink>2</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink>&gt;</PaginationLink>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
          
          {/* Availability Report */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">Availability Report</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Button variant="outline" size="sm" className="bg-white border text-gray-700">
                  Start Date
                  <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
                
                <Button variant="outline" size="sm" className="bg-white border text-gray-700">
                  End Date
                  <svg className="h-4 w-4 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
                
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  Filter
                </Button>
                
                <Button variant="outline" size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  Export
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fuel Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Available hrs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availabilityData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.id}</TableCell>
                        <TableCell>{item.fuelName}</TableCell>
                        <TableCell>{item.startDate}</TableCell>
                        <TableCell>{item.endDate}</TableCell>
                        <TableCell>{item.availableHrs}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex justify-center mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationLink disabled className="cursor-not-allowed">
                        &lt;
                      </PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink className="bg-green-500 text-white">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink>2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink>&gt;</PaginationLink>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
            
            {/* AI Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-4">AI Summary</h3>
              
              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Station Rank:</span>
                  <div className="flex items-center ml-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                    <span className="text-green-500 font-medium">High</span>
                  </div>
                </div>
                
                <p className="text-sm font-medium text-gray-700 mb-3">Summary of strengths for this gas station</p>
                
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    <span>Drivers Ranking</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    <span>Availability</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                    <span>Reason 3</span>
                  </li>
                  <li className="flex items-center">
                    <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                    <span>Reason 4</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DelegateStationDetailPage;
