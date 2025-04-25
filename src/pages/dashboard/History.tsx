
import { Card } from "@/components/ui/card";

const History = () => {
  // Placeholder data - will be replaced with backend data
  const transactions = [
    {
      id: 1,
      date: "2024-04-25",
      station: "Shell",
      amount: 45.30,
      gallons: 12,
      pricePerGallon: 3.775
    },
    {
      id: 2,
      date: "2024-04-22",
      station: "Chevron",
      amount: 38.50,
      gallons: 10,
      pricePerGallon: 3.85
    },
    {
      id: 3,
      date: "2024-04-18",
      station: "Shell",
      amount: 42.00,
      gallons: 11.2,
      pricePerGallon: 3.75
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Purchase History</h1>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Station</th>
                <th className="px-6 py-3">Gallons</th>
                <th className="px-6 py-3">Price/Gal</th>
                <th className="px-6 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{tx.date}</td>
                  <td className="px-6 py-4">{tx.station}</td>
                  <td className="px-6 py-4">{tx.gallons}</td>
                  <td className="px-6 py-4">${tx.pricePerGallon.toFixed(3)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ${tx.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default History;
