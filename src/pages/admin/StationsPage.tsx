import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface StationReport {
  stationId: string;
  name: string;
  tinNumber: string;
  category: string;
  reason: string;
  suggestion: string;
  rating: number;
  availaleHour: number;
}

const DelegateStationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<StationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 3)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const itemsPerPage = 5;
  const { toast } = useToast();

  // Calculate total hours in the date range
  const totalHoursInRange = differenceInHours(endDate, startDate);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
        
        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const response = await fetch("http://localhost:5001/api/station/report/ministry", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          })
        });

        if (!response.ok) {
          throw new Error("Failed to fetch stations");
        }

        const data = await response.json();
        setStations(data.data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, [toast, startDate, endDate]);

  // Filter stations based on search query and rating filter
  const filteredStations = stations.filter(station => {
    const matchesSearch = 
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.tinNumber.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (ratingFilter === "all") return matchesSearch;
    
    const stationRating = Math.floor(station.rating);
    return matchesSearch && stationRating.toString() === ratingFilter;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStations = filteredStations.slice(indexOfFirstItem, indexOfLastItem);

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <span key={i} className="text-yellow-500 fill-current">★</span>
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <span key={i} className="text-yellow-500 fill-current">½</span>
        );
      } else {
        stars.push(
          <span key={i} className="text-gray-300">★</span>
        );
      }
    }
    
    return <div className="flex">{stars}</div>;
  };

  // Render AI summary with appropriate color
  const renderAISummary = (summary: string) => {
    switch (summary) {
      case "Low":
        return <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span><span className="text-red-500">{summary}</span></div>;
      case "Medium":
      case "Average":
        return <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span><span className="text-yellow-500">{summary}</span></div>;
      case "High":
        return <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span><span className="text-green-500">{summary}</span></div>;
      default:
        return <div className="flex items-center"><span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span><span className="text-gray-500">{summary}</span></div>;
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFilter = () => {
    setCurrentPage(1);
  };

  const exportToPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm"
    });
    
    // Add title and header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("helvetica", "bold");
    doc.text('Fuel Stations Performance Report', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "normal");
    doc.text(`Date Range: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, 14, 27);
    doc.text(`Total Hours in Range: ${totalHoursInRange} hours`, 14, 34);
    
    // Prepare data for the table
    const tableData = filteredStations.map(station => [
      station.name,
      station.tinNumber,
      station.rating.toFixed(1),
      Math.floor(station.availaleHour),
      station.category,
      station.reason.substring(0, 50) + '...' // Truncated reason
    ]);
    
    // Add table
    autoTable(doc, {
      head: [
        [
          { content: 'Station Name', styles: { fillColor: [15, 118, 110], textColor: 255 } }, // teal-800
          { content: 'TIN Number', styles: { fillColor: [15, 118, 110], textColor: 255 } },
          { content: 'Rating', styles: { fillColor: [15, 118, 110], textColor: 255 } },
          { content: 'Available Hours', styles: { fillColor: [15, 118, 110], textColor: 255 } },
          { content: 'AI Summary', styles: { fillColor: [15, 118, 110], textColor: 255 } },
          { content: 'Reason Summary', styles: { fillColor: [15, 118, 110], textColor: 255 } }
        ]
      ],
      body: tableData,
      startY: 40,
      styles: {
        cellPadding: 3,
        fontSize: 9,
        valign: 'middle',
        halign: 'center',
        textColor: [15, 23, 42], // slate-900
        font: "helvetica"
      },
      headStyles: {
        fillColor: [15, 118, 110], // teal-800
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 60, halign: 'left' }
      },
      didDrawCell: (data) => {
        // Color code the AI Summary cells
        if (data.section === 'body' && data.column.index === 4) {
          const value = data.cell.raw as string;
          
          if (value === 'Low') {
            doc.setFillColor(239, 68, 68); // red-500
          } else if (value === 'Medium' || value === 'Average') {
            doc.setFillColor(234, 179, 8); // yellow-500
          } else if (value === 'High') {
            doc.setFillColor(34, 197, 94); // green-500
          } else {
            doc.setFillColor(100, 116, 139); // slate-500
          }
          
          // Draw colored circle
          doc.circle(
            data.cell.x + 5, 
            data.cell.y + data.cell.height / 2, 
            2, 
            'F'
          );
          
          // Add text
          doc.setTextColor(15, 23, 42); // slate-900
          doc.text(
            value, 
            data.cell.x + 10, 
            data.cell.y + data.cell.height / 2 + 2, 
            { align: 'left', baseline: 'middle' }
          );
          
          return false; // Skip default rendering
        }
      },
      willDrawCell: (data) => {
        // Add alternating row colors
        if (data.section === 'body' && data.row.index % 2 === 0) {
          doc.setFillColor(241, 245, 249); // slate-50
          doc.rect(
            data.cell.x,
            data.cell.y,
            data.cell.width,
            data.cell.height,
            'F'
          );
        }
      }
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      doc.text(
        `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
        20,
        doc.internal.pageSize.height - 10,
        { align: 'left' }
      );
    }
    
    // Save the PDF
    doc.save(`Fuel_Stations_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  if (loading) {
    return (
      <div className="bg-[#F7F9F9] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner border-4 border-green-500 border-t-transparent rounded-full w-12 h-12 animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F9F9] min-h-screen">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Stations</h1>
        <p className="text-sm text-gray-500">View Station Report</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Input 
              placeholder="Search station" 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-[#F2FCE2] border-none rounded-full focus:ring-green-500"
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px] bg-white border text-gray-700">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white border text-gray-700 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "MMM dd, yyyy") : <span>Start date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-white border text-gray-700 justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "MMM dd, yyyy") : <span>End date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleFilter}
            >
              Filter
            </Button>
            
            <Button 
              variant="outline" 
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={exportToPDF}
            >
              Export PDF
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-green-500">
              <TableRow>
                <TableHead className="text-white">ID</TableHead>
                <TableHead className="text-white">Station Name</TableHead>
                <TableHead className="text-white">TIN Number</TableHead>
                <TableHead className="text-white">Rating</TableHead>
                <TableHead className="text-white">Available Hours</TableHead>
                <TableHead className="text-white">AI Summary</TableHead>
                <TableHead className="text-white">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStations.length > 0 ? (
                currentStations.map((station, index) => (
                  <TableRow key={station.stationId} className="border-b">
                    <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden flex items-center justify-center">
                          {station.name.includes("Total") ? (
                            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">TE</div>
                          ) : station.name.includes("OLA") ? (
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">OE</div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">YM</div>
                          )}
                        </div>
                        {station.name}
                      </div>
                    </TableCell>
                    <TableCell>{station.tinNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {renderStars(station.rating)}
                        <span className="text-xs text-gray-500 mt-1">
                          {station.rating.toFixed(1)} average
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{Math.floor(station.availaleHour)}</TableCell>
                    <TableCell>
                      {renderAISummary(station.category)}
                    </TableCell>
                    <TableCell>
                      <Link to={`/delegate/stations/${station.stationId}`}>
                        <Button variant="ghost" size="sm" className="text-green-500 p-0">
                          <Eye className="h-5 w-5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No stations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredStations.length)} of {filteredStations.length}
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={currentPage === 1 ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => handlePageChange(page)}
                    isActive={page === currentPage}
                    className={page === currentPage ? "bg-green-500 text-white" : ""}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={currentPage === totalPages ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
};

export default DelegateStationsPage;