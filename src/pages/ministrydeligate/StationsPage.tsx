import { useState, useEffect, KeyboardEvent, useRef } from "react";
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
import { useNavigate } from "react-router-dom";
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
import { format, subMonths, isBefore, isAfter } from "date-fns";
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
  logo: string;
}

const DelegateStationsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [stations, setStations] = useState<StationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [filteredStations, setFilteredStations] = useState<StationReport[]>([]);
  const itemsPerPage = 5;
  const { toast } = useToast();
  const navigate = useNavigate();

  const startDatePopoverTriggerRef = useRef<HTMLButtonElement>(null);
  const endDatePopoverTriggerRef = useRef<HTMLButtonElement>(null);

  const totalAvailableHours = filteredStations.reduce(
    (sum, station) => sum + Math.floor(station.availaleHour),
    0
  );

  useEffect(() => {
    fetchStations(startDate, endDate);
  }, []);

  const fetchStations = async (start: Date, end: Date) => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!authToken) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/api/station/report/ministry`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          start_date: start.toISOString(),
          end_date: end.toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch stations: ${errorData.message || "Unknown error"}`);
      }

      const data = await response.json();
      setStations(data.data);
      applyFilters(data.data, searchQuery, rankFilter);
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

  const applyFilters = (dataToFilter: StationReport[], query: string, rank: string) => {
    let filtered = [...dataToFilter];

    if (query) {
      filtered = filtered.filter(station =>
        station.name.toLowerCase().includes(query.toLowerCase()) ||
        station.tinNumber.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (rank !== "all") {
      filtered = filtered.filter(station =>
        station.category.toLowerCase() === rank.toLowerCase()
      );
    }

    setFilteredStations(filtered);
    setCurrentPage(1);
  };

  const handleRankFilterChange = (value: string) => {
    setRankFilter(value);
    applyFilters(stations, searchQuery, value);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(stations, query, rankFilter);
  };

  const handleFilter = async () => {
    if (isAfter(startDate, endDate)) {
      toast({
        title: "Invalid Date Range",
        description: "The start date must be before the end date.",
        variant: "destructive"
      });
      return;
    }

    if (isAfter(endDate, new Date())) {
      toast({
        title: "Invalid End Date",
        description: "End date cannot be in the future.",
        variant: "destructive"
      });
      return;
    }

    await fetchStations(startDate, endDate);

    toast({
      title: "Filter Applied",
      description: `Showing data from ${format(startDate, 'MMM dd, yyyy')} to ${format(endDate, 'MMM dd, yyyy')}`,
    });
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleFilter();
    }
  };

  const navigateToDetail = (station: StationReport) => {
    navigate(`/ministry-delegate/stations/${station.stationId}`, {
      state: {
        rank: station.category,
        reason: station.reason
      }
    });
  };

  const totalPages = Math.ceil(filteredStations.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStations = filteredStations.slice(indexOfFirstItem, indexOfLastItem);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="text-yellow-500 fill-current">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="text-yellow-500 fill-current">½</span>);
      } else {
        stars.push(<span key={i} className="text-gray-300">★</span>);
      }
    }

    return <div className="flex">{stars}</div>;
  };

  const getSummaryColor = (summary: string) => {
    switch (summary.toLowerCase()) {
      case "low": return { bg: "bg-red-500", text: "text-red-500" };
      case "average": return { bg: "bg-yellow-500", text: "text-yellow-500" };
      case "high": return { bg: "bg-green-500", text: "text-green-500" };
      default: return { bg: "bg-gray-500", text: "text-gray-500" };
    }
  };

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

  // Calculate which two pages to show
  const getVisiblePages = () => {
    if (totalPages <= 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage === 1) {
      return [1, 2];
    }
    
    if (currentPage === totalPages) {
      return [totalPages - 1, totalPages];
    }
    
    return [currentPage - 1, currentPage];
  };

  const visiblePages = getVisiblePages();

  const exportToPDF = () => {
    if (filteredStations.length === 0) {
      toast({
        title: "No Data to Export",
        description: "There are no stations to export with the current filters.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Preparing PDF",
      description: "Generating your report, please wait...",
    });

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Dark green theme
    const headerColor = [0, 100, 0]; // Dark green
    const alternateRowColor = [240, 255, 240]; // Light green

    // Title and metadata
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text('Fuel Stations Performance Report', 105, 15, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(`Date Range: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, 14, 25);
    doc.text(`Total Available Hours: ${totalAvailableHours}`, 14, 32);

    if (rankFilter !== "all") {
      doc.text(`AI Rank Filter: ${rankFilter}`, 14, 39);
    }

    // Calculate column widths to fit the page
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const availableWidth = pageWidth - (margin * 2);
    const columnWidths = [
      availableWidth * 0.25, // Name
      availableWidth * 0.15, // TIN
      availableWidth * 0.1,  // Rating
      availableWidth * 0.1,  // Hours
      availableWidth * 0.1,  // Rank
      availableWidth * 0.3   // Reason
    ];

    // Prepare data
    const tableData = filteredStations.map(station => [
      station.name,
      station.tinNumber,
      station.rating.toFixed(1),
      Math.floor(station.availaleHour),
      station.category,
      station.reason
    ]);

    // Generate table
    autoTable(doc, {
      head: [
        [
          'Station Name',
          'TIN Number',
          'Rating',
          'Available Hours',
          'AI Rank',
          'Reason'
        ]
      ],
      body: tableData,
      startY: 45,
      margin: { top: 45, left: margin, right: margin },
      styles: {
        cellPadding: 3,
        fontSize: 9,
        valign: 'middle',
        textColor: [0, 0, 0],
        font: "helvetica",
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: headerColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: columnWidths[0] },
        1: { halign: 'left', cellWidth: columnWidths[1] },
        2: { halign: 'center', cellWidth: columnWidths[2] },
        3: { halign: 'center', cellWidth: columnWidths[3] },
        4: { halign: 'center', cellWidth: columnWidths[4] },
        5: { halign: 'left', cellWidth: columnWidths[5] }
      },
      alternateRowStyles: {
        fillColor: alternateRowColor
      },
      didDrawPage: () => {
        // Don't repeat header on each page
      }
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - margin,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
      doc.text(
        `Created on: ${format(new Date(), 'MMM dd, yyyy')}`,
        margin,
        doc.internal.pageSize.height - 10,
        { align: 'left' }
      );
    }

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
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              className="pl-10 bg-[#F2FCE2] border-none rounded-full focus:ring-green-500"
            />
            <div className="absolute inset-y-0 left-3 flex items-center">
              <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select
              value={rankFilter}
              onValueChange={handleRankFilterChange}
            >
              <SelectTrigger className="w-[180px] bg-white border text-gray-700">
                <SelectValue placeholder="Filter by AI rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ranks</SelectItem>
                <SelectItem value="low">Low Rank</SelectItem>
                <SelectItem value="average">Average Rank</SelectItem>
                <SelectItem value="high">High Rank</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild ref={startDatePopoverTriggerRef}>
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
                  onSelect={(date) => {
                    if (date) {
                      setStartDate(date);
                      if (startDatePopoverTriggerRef.current) {
                        startDatePopoverTriggerRef.current.click();
                      }
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild ref={endDatePopoverTriggerRef}>
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
                  onSelect={(date) => {
                    if (date) {
                      setEndDate(date);
                      if (endDatePopoverTriggerRef.current) {
                        endDatePopoverTriggerRef.current.click();
                      }
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleFilter}
            >
              Filter
            </Button>

            <Button
              className="bg-green-800 hover:bg-green-900 text-white font-bold"
              onClick={exportToPDF}
            >
              Export PDF
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-green-600">
              <TableRow>
                <TableHead className="text-white text-left">ID</TableHead>
                <TableHead className="text-white text-left">Station Name</TableHead>
                <TableHead className="text-white text-left">TIN Number</TableHead>
                <TableHead className="text-white text-center">Rating</TableHead>
                <TableHead className="text-white text-center">Available Hours</TableHead>
                <TableHead className="text-white text-center">AI Rank</TableHead>
                <TableHead className="text-white text-left">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStations.length > 0 ? (
                currentStations.map((station, index) => (
                  <TableRow key={station.stationId} className="border-b hover:bg-green-50">
                    <TableCell className="text-left">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell className="font-medium text-left">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden flex items-center justify-center">
                          <img
                            src={station.logo}
                            alt={station.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                            }}
                          />
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
                        className="text-green-600 p-0 hover:bg-green-100"
                        onClick={() => navigateToDetail(station)}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No stations found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredStations.length > itemsPerPage && (
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

                {visiblePages.map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className={page === currentPage ? "bg-green-600 text-white" : ""}
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
        )}
      </div>
    </div>
  );
};

export default DelegateStationsPage;