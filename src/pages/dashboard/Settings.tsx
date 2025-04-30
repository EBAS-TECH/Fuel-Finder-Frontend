
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Settings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Profile Information</h3>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <Input type="text" placeholder="John Doe" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input type="email" placeholder="john@example.com" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <Input type="tel" placeholder="+1 (555) 000-0000" />
          </div>
          
          <Button className="w-full">Update Profile</Button>
        </div>
      </Card>
      
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Preferences</h3>
        <div className="space-y-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Default Gas Type</label>
            <select className="w-full p-2 border rounded-md">
              <option>Regular Unleaded</option>
              <option>Premium</option>
              <option>Diesel</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search Radius (miles)</label>
            <Input type="number" placeholder="5" />
          </div>
          
          <Button className="w-full">Save Preferences</Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
