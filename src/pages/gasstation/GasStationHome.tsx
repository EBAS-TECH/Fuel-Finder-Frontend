
import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// Mock data for charts
const fuelSalesData = [
  { name: "Jan", diesel: 400, gasoline: 240 },
  { name: "Feb", diesel: 300, gasoline: 290 },
  { name: "Mar", diesel: 500, gasoline: 320 },
  { name: "Apr", diesel: 280, gasoline: 220 },
  { name: "May", diesel: 590, gasoline: 360 },
  { name: "Jun", diesel: 490, gasoline: 290 },
  { name: "Jul", diesel: 380, gasoline: 300 },
];

const dailyTrafficData = [
  { hour: '6AM', traffic: 40 },
  { hour: '8AM', traffic: 120 },
  { hour: '10AM', traffic: 80 },
  { hour: '12PM', traffic: 100 },
  { hour: '2PM', traffic: 60 },
  { hour: '4PM', traffic: 90 },
  { hour: '6PM', traffic: 140 },
  { hour: '8PM', traffic: 70 },
  { hour: '10PM', traffic: 30 },
];

const GasStationHome = () => {
  const [metrics] = useState({
    totalSales: "$24,345",
    salesGrowth: "+12.5%",
    customers: "1,234",
    customerGrowth: "+5.3%",
    fuelVolume: "12,450 L",
    volumeGrowth: "-2.1%",
    feedback: "4.7",
    totalFeedbacks: 156,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold">{metrics.totalSales}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-fuelGreen-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className={`text-sm mt-2 ${metrics.salesGrowth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.salesGrowth} from last month
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Customers</p>
              <h3 className="text-2xl font-bold">{metrics.customers}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <p className={`text-sm mt-2 ${metrics.customerGrowth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.customerGrowth} from last month
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Fuel Volume</p>
              <h3 className="text-2xl font-bold">{metrics.fuelVolume}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <p className={`text-sm mt-2 ${metrics.volumeGrowth.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
            {metrics.volumeGrowth} from last month
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Feedback Rating</p>
              <h3 className="text-2xl font-bold">{metrics.feedback}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <p className="text-sm mt-2 text-gray-500">
            Based on {metrics.totalFeedbacks} feedbacks
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Monthly Fuel Sales</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fuelSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="diesel" 
                  stroke="#16a34a" 
                  strokeWidth={2} 
                  name="Diesel" 
                />
                <Line 
                  type="monotone" 
                  dataKey="gasoline" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  name="Gasoline" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Daily Traffic Pattern</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyTrafficData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="traffic" fill="#16a34a" name="Customer Traffic" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="h-10 w-10 rounded-full bg-fuelGreen-100 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-5 h-5 text-fuelGreen-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Fuel stock updated</p>
                  <p className="text-xs text-gray-500">Diesel: 5000L added to inventory</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Fuel Availability</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm">Diesel</span>
              </div>
              <span className="text-sm font-medium">Available</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                <span className="text-sm">Gasoline</span>
              </div>
              <span className="text-sm font-medium">Low Stock</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-sm">Premium</span>
              </div>
              <span className="text-sm font-medium">Out of Stock</span>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Diesel</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Gasoline</span>
                <span className="text-sm font-medium">25%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "25%" }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Premium</span>
                <span className="text-sm font-medium">0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GasStationHome;