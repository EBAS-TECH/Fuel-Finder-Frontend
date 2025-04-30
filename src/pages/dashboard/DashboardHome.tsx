
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Placeholder data - will be replaced with real data from backend
const fuelPriceData = [
  { date: "Mon", price: 3.5 },
  { date: "Tue", price: 3.6 },
  { date: "Wed", price: 3.4 },
  { date: "Thu", price: 3.8 },
  { date: "Fri", price: 3.7 },
  { date: "Sat", price: 3.9 },
  { date: "Sun", price: 3.6 },
];

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Last Purchase</h3>
          <p className="text-3xl font-bold text-fuelGreen-500">$45.30</p>
          <p className="text-sm text-gray-500 mt-1">Shell - 12 gal</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Monthly Spent</h3>
          <p className="text-3xl font-bold text-fuelGreen-500">$280.50</p>
          <p className="text-sm text-gray-500 mt-1">vs $310.20 last month</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Favorite Station</h3>
          <p className="text-3xl font-bold text-fuelGreen-500">Shell</p>
          <p className="text-sm text-gray-500 mt-1">5 visits this month</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Fuel Price Trend</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fuelPriceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#16a34a"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default DashboardHome;
