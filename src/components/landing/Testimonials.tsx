import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    text: "It's very cool app that solved Ethiopian fuel traffic issue. I have used it a lot and it is very useful. I can get and see nearby station and also add by myself.",
    name: "Biniyam",
    role: "Driver",
    rating: 5
  },
  {
    id: 2,
    text: "I am new to this best platform. I fall in love with the Fuel Finder app - precise, good and helpful when I get the near station. I recommend to use it all.",
    name: "Biruk Wondmenh",
    role: "Driver",
    rating: 5
  },
  {
    id: 3,
    text: "I have used it since it was published and then it is very good. User responsible and anyone can use it. I can use it perfectly. I recommend it for you. Thanks the Fuel Finder!",
    name: "Kirubel Dagne",
    role: "Driver",
    rating: 5
  }
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const visibleTestimonials = [
    testimonials[activeIndex],
    testimonials[(activeIndex + 1) % testimonials.length]
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="text-center mb-12">
          <span className="text-fuelGreen-500 text-sm uppercase font-semibold tracking-wider">Testimonial</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 text-fuelBlue-500">
            We are happy to share our client's review
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {visibleTestimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        <div className="flex justify-center mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full mx-1 ${
                activeIndex === index ? 'bg-fuelGreen-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface TestimonialProps {
  testimonial: {
    id: number;
    text: string;
    name: string;
    role: string;
    rating: number;
  };
}

const TestimonialCard = ({ testimonial }: TestimonialProps) => {
  return (
    <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow animate-fade-in">
      <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 overflow-hidden">
          <img
            src={`https://randomuser.me/api/portraits/men/${testimonial.id + 10}.jpg`}
            alt={testimonial.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-medium text-fuelBlue-500">{testimonial.name}</h4>
          <p className="text-sm text-gray-500">{testimonial.role}</p>
        </div>
        <div className="ml-auto flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-5 h-5 ${
                i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;