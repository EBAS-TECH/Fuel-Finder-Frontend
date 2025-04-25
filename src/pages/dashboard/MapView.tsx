
import { Card } from "@/components/ui/card";

const MapView = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Find Gas Stations</h1>
      
      <Card className="h-[calc(100vh-12rem)]">
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Map will be integrated here with the backend API</p>
        </div>
      </Card>
    </div>
  );
};

export default MapView;
