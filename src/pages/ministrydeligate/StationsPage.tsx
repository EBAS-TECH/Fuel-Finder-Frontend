import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [filteredStations, setFilteredStations] = useState<StationReport[]>([]);
  const itemsPerPage = 5;
  const { toast } = useToast();
  const navigate = useNavigate();

  // Calculate total hours in the date range
  const totalHoursInRange = differenceInHours(endDate, startDate);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const response = await fetch(`${API_BASE_URL}/api/station/report/ministry`, {
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
          const errorData = await response.json();
          throw new Error(`Failed to fetch stations: ${errorData.message || "Unknown error"}`);
        }

        const data = await response.json();
        setStations(data.data);
        setFilteredStations(data.data); // Initialize filtered stations
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
  }, [toast]); // Removed dependencies to fetch only on initial load

  // Apply filters when filter button is clicked
  const handleFilter = () => {
    // Check if the date range is valid
    if (startDate > endDate) {
      toast({
        title: "Invalid Date Range",
        description: "The start date must be before the end date.",
        variant: "destructive"
      });
      return;
    }

    const filtered = stations.filter(station => {
      const matchesSearch =
        station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        station.tinNumber.toLowerCase().includes(searchQuery.toLowerCase());

      if (ratingFilter === "all") return matchesSearch;

      const stationRating = Math.floor(station.rating);
      return matchesSearch && stationRating.toString() === ratingFilter;
    });

    if (filtered.length === 0) {
      toast({
        title: "No Data Found",
        description: "No stations found for the specified date range.",
        variant: "destructive"
      });
      return;
    }

    setFilteredStations(filtered);
    setCurrentPage(1);
    toast({
      title: "Filter Applied",
      description: `Showing ${filtered.length} stations matching your criteria`,
    });
  };

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

  // Get color for AI summary
  const getSummaryColor = (summary: string) => {
    switch (summary.toLowerCase()) {
      case "low":
        return { bg: "bg-red-500", text: "text-red-500" };
      case "medium":
      case "average":
        return { bg: "bg-yellow-500", text: "text-yellow-500" };
      case "high":
        return { bg: "bg-green-500", text: "text-green-500" };
      default:
        return { bg: "bg-gray-500", text: "text-gray-500" };
    }
  };

  // Render AI summary with appropriate color
  const renderAISummary = (summary: string) => {
    const color = getSummaryColor(summary);
    return (
      <div className="flex items-center">
        <span className={`h-2 w-2 rounded-full ${color.bg} mr-2`}></span>
        <span className={color.text}>{summary}</span>
      </div>
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const exportToPDF = () => {
    toast({
      title: "Preparing PDF",
      description: "Generating your report, please wait...",
    });

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Add title and header with dark green theme
    doc.setFontSize(18);
    doc.setTextColor(22, 101, 52); // green-800
    doc.setFont("helvetica", "bold");
    doc.text('Fuel Stations Performance Report', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "normal");
    doc.text(`Date Range: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, 14, 30);
    doc.text(`Total Hours in Range: ${totalHoursInRange} hours`, 14, 37);

    // Prepare data for the table
    const tableData = filteredStations.map(station => [
      station.name,
      station.tinNumber,
      station.rating.toFixed(1),
      Math.floor(station.availaleHour),
      station.category
    ]);

    // Add table with light green theme
    autoTable(doc, {
      head: [
        [
          { content: 'Station Name', styles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' } },
          { content: 'TIN Number', styles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'left' } },
          { content: 'Rating', styles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'Available Hours', styles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' } },
          { content: 'AI Summary', styles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' } }
        ]
      ],
      body: tableData,
      startY: 45,
      styles: {
        cellPadding: 3,
        fontSize: 9,
        valign: 'middle',
        textColor: [15, 23, 42],
        font: "helvetica",
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [16, 185, 129], // green-500
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 50 },
        1: { halign: 'left', cellWidth: 35 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' }
      },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const value = data.cell.raw as string;
          const color = getSummaryColor(value);

          let rgbColor: [number, number, number] = [100, 116, 139]; // default gray
          if (color.text === "text-red-500") rgbColor = [239, 68, 68];
          else if (color.text === "text-yellow-500") rgbColor = [234, 179, 8];
          else if (color.text === "text-green-500") rgbColor = [34, 197, 94];

          doc.setTextColor(rgbColor[0], rgbColor[1], rgbColor[2]);

          doc.text(
            value,
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2 + 2,
            { align: 'center', baseline: 'middle' }
          );

          return false;
        }
      },
      willDrawCell: (data) => {
        if (data.section === 'body' && data.row.index % 2 === 0) {
          doc.setFillColor(240, 253, 244);
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
      doc.setTextColor(100, 116, 139);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      doc.text(
        `Created on: ${format(new Date(), 'MMM dd, yyyy')}`,
        20,
        doc.internal.pageSize.height - 10,
        { align: 'left' }
      );
    }

    // Save the PDF
    doc.save(`Fuel_Stations_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

    toast({
      title: "PDF Downloaded",
      description: "Your report has been successfully downloaded",
    });
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
              className="bg-green-500 hover:bg-green-500 text-white font-bold"
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
                <TableHead className="text-white text-left">ID</TableHead>
                <TableHead className="text-white text-left">Station Name</TableHead>
                <TableHead className="text-white text-left">TIN Number</TableHead>
                <TableHead className="text-white text-center">Rating</TableHead>
                <TableHead className="text-white text-center">Available Hours</TableHead>
                <TableHead className="text-white text-center">AI Summary</TableHead>
                <TableHead className="text-white text-left">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStations.length > 0 ? (
                currentStations.map((station, index) => (
                  <TableRow key={station.stationId} className="border-b">
                    <TableCell className="text-left">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell className="font-medium text-left">
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
                    <TableCell className="text-left">{station.tinNumber}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                        {renderStars(station.rating)}
                        <span className="text-xs text-gray-500 mt-1">
                          {station.rating.toFixed(1)} average
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{Math.floor(station.availaleHour)}</TableCell>
                    <TableCell className="text-center">
                      {renderAISummary(station.category)}
                    </TableCell>
                    <TableCell className="text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-500 p-0"
                        onClick={() => navigate(`/ministry-delegate/stations/${station.stationId}`)}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
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
