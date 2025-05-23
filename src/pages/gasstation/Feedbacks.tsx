import { useState, useEffect, useRef } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Feedback {
  id: string;
  user_id: string;
  station_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  name?: string;
  avatar?: string;
}

interface RatingData {
  average_rate: string;
  star_1: string;
  star_2: string;
  star_3: string;
  star_4: string;
  star_5: string;
  total: string;
}

interface Station {
  id: string;
  en_name: string;
  am_name: string;
  tin_number: string;
  user_id: string;
  address: string;
  availability: boolean;
  status: string;
  created_at: string;
  updated_at: string | null;
  latitude: number;
  longitude: number;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  profile_pic: string;
  verified: boolean;
  created_at: string;
  updated_at: string | null;
}

const Feedbacks = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [feedbacksData, setFeedbacksData] = useState<Feedback[]>([]);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [averageRating, setAverageRating] = useState("0.0");
  const [selectedFilter, setSelectedFilter] = useState("Stars");
  const [station, setStation] = useState<Station | null>(null);
  const [date, setDate] = useState<Date>();
  const popoverTriggerRef = useRef<HTMLButtonElement>(null);

  // Fetch station, feedback, and user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");
        if (!userId) {
          throw new Error("User not authenticated");
        }

        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

        // Fetch the station information for this user
        const stationResponse = await fetch(`${API_BASE_URL}/api/station/user/${userId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!stationResponse.ok) {
          throw new Error("Failed to fetch station data");
        }

        const stationResult = await stationResponse.json();
        const stationData: Station = stationResult.data;
        setStation(stationData);

        // Fetch the rating data for this station
        const ratingResponse = await fetch(`${API_BASE_URL}/api/feedback/rate`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!ratingResponse.ok) {
          throw new Error("Failed to fetch rating data");
        }

        const ratingResult = await ratingResponse.json();
        setRatingData(ratingResult.data);

        // Use the average_rate directly from the backend
        setAverageRating(parseFloat(ratingResult.data.average_rate).toFixed(1));

        // Fetch feedbacks for this station
        const feedbackResponse = await fetch(`${API_BASE_URL}/api/feedback/station/${stationData.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!feedbackResponse.ok) {
          throw new Error("Failed to fetch feedback data");
        }

        const feedbackResult = await feedbackResponse.json();

        // Fetch user details for each feedback
        const feedbacksWithUserDetails = await Promise.all(
          feedbackResult.data.map(async (feedback: Feedback) => {
            const userResponse = await fetch(`${API_BASE_URL}/api/user/${feedback.user_id}`, {
              headers: {
                "Authorization": `Bearer ${token}`
              }
            });

            if (!userResponse.ok) {
              throw new Error("Failed to fetch user data");
            }

            const userResult = await userResponse.json();
            const userData: User = userResult.data;

            return {
              ...feedback,
              name: `${userData.first_name} ${userData.last_name}`,
              avatar: userData.profile_pic,
              date: new Date(feedback.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            };
          })
        );

        setFeedbacksData(feedbacksWithUserDetails);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, []);

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

  // Filter feedbacks based on selected filter and date
  const filteredFeedbacks = feedbacksData.filter(feedback => {
    const feedbackDate = new Date(feedback.created_at);
    const isDateMatch = date ? feedbackDate.toDateString() === date.toDateString() : true;

    if (selectedFilter === "Stars") return isDateMatch;
    if (selectedFilter === "1") return feedback.rating === 1 && isDateMatch;
    if (selectedFilter === "3") return feedback.rating === 3 && isDateMatch;
    if (selectedFilter === "5") return feedback.rating === 5 && isDateMatch;
    if (selectedFilter === "4") return feedback.rating === 4 && isDateMatch;
    if (selectedFilter === "2") return feedback.rating === 2 && isDateMatch;
    return isDateMatch;
  });

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
            Feedbacks for {station?.en_name || "Your Station"}
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
            <span className="text-sm text-gray-500 ml-2">
              ({ratingData?.total || 0} ratings)
            </span>
          </div>

          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center">
                <div className="flex w-24">{renderStars(stars)}</div>
                <div className="w-full h-2 mx-4 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-yellow-400 rounded"
                    style={{
                      width: `${ratingData && parseInt(ratingData.total) > 0
                        ? (parseInt(ratingData[`star_${stars}` as keyof RatingData]) / parseInt(ratingData.total)) * 100
                        : 0}%`
                    }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500 w-20 text-right">
                  {ratingData ? ratingData[`star_${stars}` as keyof RatingData] : 0}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Feedbacks</h2>
            <div className="flex space-x-2">
              <Select onValueChange={setSelectedFilter} defaultValue="Stars">
                <SelectTrigger className="w-[150px] h-8 text-xs bg-white hover:bg-fuelGreen-400 hover:text-white">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Stars">All Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild ref={popoverTriggerRef}>
                  <Button
                    variant={"outline"}
                    className="w-[180px] justify-start text-left font-normal h-8 text-xs bg-white hover:bg-fuelGreen-400 hover:text-white"
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate) => {
                      setDate(selectedDate);
                      if (popoverTriggerRef.current) {
                        popoverTriggerRef.current.click();
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-6">
            {filteredFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="border-l-4 border-fuelGreen-500 pl-4 py-1"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={feedback.avatar} alt={feedback.name} />
                      <AvatarFallback>{feedback.name?.charAt(0) || "A"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{feedback.name}</h3>
                      <div className="flex items-center">
                        <div className="flex mr-2">
                          {renderStars(feedback.rating)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(feedback.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{feedback.comment}</p>
              </div>
            ))}
          </div>

          {filteredFeedbacks.length > 3 && (
            <div className="flex items-center justify-center mt-6 gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
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
                className="h-8 w-8 rounded-full bg-fuelGreen-400 hover:bg-fuelGreen-500"
              >
                {page}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 rounded-full"
                onClick={() => setPage(prev => prev + 1)}
              >
                {page + 1}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setPage(prev => prev + 1)}
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default Feedbacks;
