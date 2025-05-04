import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for feedbacks
const feedbacksData = [
  {
    id: 1,
    name: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 5,
    comment:
      "I was running on empty during a fuel shortage - this app helped me find a nearby station in minutes. Total lifesaver!",
    avatar: "/lovable-uploads/3220882f-7d01-453f-8e98-dc630f35be68.png",
  },
  {
    id: 2,
    name: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 4,
    comment:
      "I was running on empty during a fuel shortage - this app helped me find a nearby station in minutes. Total lifesaver!",
    avatar: "/lovable-uploads/3220882f-7d01-453f-8e98-dc630f35be68.png",
  },
  {
    id: 3,
    name: "Samuel Terefe",
    date: "22 Jan 2025",
    rating: 2,
    comment:
      "I was running on empty during a fuel shortage - this app helped me find a nearby station in minutes. Total lifesaver!",
    avatar: "/lovable-uploads/3220882f-7d01-453f-8e98-dc630f35be68.png",
  },
];

// Rating distribution data
const ratingDistribution = [
  { stars: 5, users: 200 },
  { stars: 4, users: 230 },
  { stars: 3, users: 100 },
  { stars: 2, users: 230 },
  { stars: 1, users: 200 },
];

const dashboards = () => {
  const [page, setPage] = useState(1);

  // Calculate average rating
  const totalRatings = ratingDistribution.reduce(
    (acc, item) => acc + item.users,
    0
  );
  const weightedSum = ratingDistribution.reduce(
    (acc, item) => acc + item.stars * item.users,
    0
  );
  const averageRating =
    totalRatings > 0 ? (weightedSum / totalRatings).toFixed(1) : "0.0";

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
    ));
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <div className="flex-1">
          <svg
            className="w-6 h-6 text-fuelGreen-500 inline-block mr-2"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h1 className="text-xl font-semibold text-fuelGreen-500 inline-block">
            Feedbacks
          </h1>
          <p className="text-gray-500 ml-8">
            Rating and feedback of your station
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Your Rating</h2>
          <div className="flex items-center mb-6">
            <div className="flex mr-2">
              {renderStars(Math.round(parseFloat(averageRating)))}
            </div>
            <span className="text-2xl font-bold">{averageRating}</span>
          </div>

          <div className="space-y-4">
            {ratingDistribution.map((item) => (
              <div key={item.stars} className="flex items-center">
                <div className="flex w-24">{renderStars(item.stars)}</div>
                <div className="w-full h-2 mx-4 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-yellow-400 rounded"
                    style={{ width: `${(item.users / totalRatings) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 w-20 text-right">
                  {item.users} Users
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Feedbacks</h2>
            <Select defaultValue="Stars">
              <SelectTrigger className="w-[100px] h-8 text-xs bg-white">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Stars">Stars</SelectItem>
                <SelectItem value="oldest">⭐</SelectItem>
                <SelectItem value="highest">⭐⭐⭐⭐st Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-6">
            {feedbacksData.map((feedback) => (
              <div
                key={feedback.id}
                className="border-l-4 border-fuelGreen-500 pl-4 py-1"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={feedback.avatar} alt={feedback.name} />
                      <AvatarFallback>{feedback.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{feedback.name}</h3>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(feedback.rating)}
                        </div>
                        <p className="text-xs text-gray-500">{feedback.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{feedback.comment}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center mt-6 gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={page === 1}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Previous</span>
            </Button>
            <Button
              size="sm"
              className="h-8 w-8 rounded-full bg-fuelGreen-500 hover:bg-fuelGreen-600"
            >
              1
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 rounded-full"
            >
              2
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default dashboards;
