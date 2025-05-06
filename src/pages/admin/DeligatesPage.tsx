import React, { useState } from "react";
import { Edit, Trash2, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

// Sample data for delegates
const delegatesData = [
  {
    id: 1,
    firstName: "Solomon",
    lastName: "Bekele",
    username: "solbek123",
    email: "solomon123@gmail.com",
    avatar: "/lovable-uploads/86065143-bd67-4268-aa7e-f5d5b4fac7e6.png",
  },
  {
    id: 2,
    firstName: "Abrham",
    lastName: "Ababu",
    username: "abrah456",
    email: "abrham456@gmail.com",
    avatar: "/lovable-uploads/86065143-bd67-4268-aa7e-f5d5b4fac7e6.png",
  },
  {
    id: 3,
    firstName: "Solomon",
    lastName: "Ababu",
    username: "abrah456",
    email: "abrham456@gmail.com",
    avatar: "/lovable-uploads/86065143-bd67-4268-aa7e-f5d5b4fac7e6.png",
  },
];

export default function DelegatesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [newDelegate, setNewDelegate] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
  });

  // Pagination handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDelegate((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally add the delegate to the database
    console.log("New delegate:", newDelegate);
    // Reset form
    setNewDelegate({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
    });
    // Close dialog would happen automatically with DialogClose
  };

  return (
    <div>
      <div className="flex items-center mb-5">
        <div className="flex items-center text-emerald-500">
          <Delegate className="h-6 w-6 mr-2" />
          <h1 className="text-xl font-medium">Delegates</h1>
        </div>
        <p className="text-gray-400 text-sm ml-2">Delegates management</p>
      </div>

      <div className="bg-[#F1F7F7] p-6 rounded-lg">
        <div className="flex justify-between items-center mb-5">
          <div className="w-72 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search station"
              className="pl-10 bg-white border-none rounded-full h-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Delegate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Delegate</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="firstName"
                        className="text-sm font-medium mb-1 block"
                      >
                        First Name *
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="Enter first name"
                        value={newDelegate.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="lastName"
                        className="text-sm font-medium mb-1 block"
                      >
                        Last Name *
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Enter last name"
                        value={newDelegate.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="username"
                      className="text-sm font-medium mb-1 block"
                    >
                      Username *
                    </label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="Enter username"
                      value={newDelegate.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-medium mb-1 block"
                    >
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email"
                      value={newDelegate.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <DialogClose asChild>
                    <Button
                      type="submit"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      Add Delegate
                    </Button>
                  </DialogClose>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-emerald-500 text-white text-left">
                <th className="py-4 px-4 w-16">ID</th>
                <th className="py-4 px-4">First Name</th>
                <th className="py-4 px-4">Last Name</th>
                <th className="py-4 px-4">Username</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {delegatesData.map((delegate) => (
                <tr key={delegate.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">{delegate.id}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={delegate.avatar}
                          alt={`${delegate.firstName} ${delegate.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {delegate.firstName}
                    </div>
                  </td>
                  <td className="py-4 px-4">{delegate.lastName}</td>
                  <td className="py-4 px-4">{delegate.username}</td>
                  <td className="py-4 px-4 text-emerald-500">
                    {delegate.email}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 bg-emerald-100 rounded-md hover:bg-emerald-200">
                        <Edit className="h-4 w-4 text-emerald-600" />
                      </button>
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
          <div className="text-sm text-gray-500">Showing 1 - 3 of 2</div>
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-full bg-gray-200 text-gray-600"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="h-4 w-4" />
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
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom icon components
const Delegate = (props: any) => {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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
