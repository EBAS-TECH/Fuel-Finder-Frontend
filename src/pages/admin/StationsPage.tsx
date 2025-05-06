import React, { useState } from "react";
import { Eye, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

// Sample data for stations
const stationsData = [
  {
    id: 1,
    name: "Total Energies Near Mexico Sq",
    username: "totaet123",
    email: "totalct123@gmail.com",
    address: "Around Mexico Sq",
    logo: "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png",
  },
  {
    id: 2,
    name: "Yetebaberut Medber near st.",
    username: "yetebej123",
    email: "yetet123@gmail.com",
    address: "Around Mexico Sq",
    logo: "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png",
  },
  {
    id: 3,
    name: "OLA Energies station near cit.",
    username: "yetebej123",
    email: "olat123@gmail.com",
    address: "Around Mexico Sq",
    logo: "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png",
  },
  {
    id: 4,
    name: "Total Energies near Mexico Sq",
    username: "totaet123",
    email: "totalt123@gmail.com",
    address: "Around Mexico Sq",
    logo: "/lovable-uploads/3b24a52c-5dee-4810-98d3-f9832a4c6d5e.png",
  },
];

export default function StationsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <Stations className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Stations</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Stations management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <Tabs
          defaultValue="pending"
          className="mb-5"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-3 max-w-[400px] bg-transparent gap-2">
            <TabsTrigger
              value="pending"
              className={`bg-white border ${
                activeTab === "pending"
                  ? "border-emerald-500 text-emerald-500"
                  : "border-transparent"
              } rounded-lg shadow-sm`}
            >
              Pending
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className={`bg-white border ${
                activeTab === "approved"
                  ? "border-emerald-500 text-emerald-500"
                  : "border-transparent"
              } rounded-lg shadow-sm`}
            >
              Approved
            </TabsTrigger>
            <TabsTrigger
              value="rejected"
              className={`bg-white border ${
                activeTab === "rejected"
                  ? "border-emerald-500 text-emerald-500"
                  : "border-transparent"
              } rounded-lg shadow-sm`}
            >
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-72 relative mb-5">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search station"
            className="pl-10 bg-white border-none rounded-full h-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-emerald-500 text-white text-left">
                <th className="py-4 px-4 w-16">ID</th>
                <th className="py-4 px-4">Station Name</th>
                <th className="py-4 px-4">Username</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Address</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {stationsData.map((station) => (
                <tr key={station.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">{station.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                        <img
                          src={station.logo}
                          alt={station.name}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                      {station.name}
                    </div>
                  </td>
                  <td className="py-4 px-4">{station.username}</td>
                  <td className="py-4 px-4 text-emerald-500">
                    {station.email}
                  </td>
                  <td className="py-4 px-4">{station.address}</td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-2">
                      <Link to={`/admin/stations/${station.id}`}>
                        <button className="p-1.5 bg-emerald-100 rounded-md hover:bg-emerald-200">
                          <Eye className="h-4 w-4 text-emerald-600" />
                        </button>
                      </Link>
                      <button className="p-1.5 bg-red-100 rounded-md hover:bg-red-200">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Showing 1 - 4 of 27</div>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-full bg-gray-200 text-gray-600"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {[1, 2, 3].map((page) => (
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
              disabled={currentPage === 3}
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom icon components
const Stations = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9h18v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
      <path d="M12 3v6" />
    </svg>
  );
};

const ArrowLeft = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
};

const ArrowRight = (props: any) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
};
