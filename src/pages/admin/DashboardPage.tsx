import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Users, Fuel, User } from "lucide-react";

// Sample data for the charts
const userData = [
  { month: "Jan", users: 65, stations: 42 },
  { month: "Feb", users: 79, stations: 45 },
  { month: "Mar", users: 95, stations: 50 },
  { month: "Apr", users: 112, stations: 58 },
  { month: "May", users: 124, stations: 65 },
  { month: "Jun", users: 137, stations: 72 },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <Users className="h-5 w-5 text-green-500" />
              Total Drivers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">124</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <Fuel className="h-5 w-5 text-green-500" />
              Total Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">85</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600">
              <User className="h-5 w-5 text-green-500" />
              Total Delegates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">1</div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className="mb-8 border-green-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-green-600">
            User & Station Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={userData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#10B981"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name="Drivers"
                />
                <Line
                  type="monotone"
                  dataKey="stations"
                  stroke="#059669"
                  strokeWidth={2}
                  name="Stations"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
