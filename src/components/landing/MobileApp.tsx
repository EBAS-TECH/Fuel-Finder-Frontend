import truephone from "@/assets/truephone.png";

const MobileApp = () => {
  return (
    <section className="py-16 bg-fuelGreen-50">
      <div className="container mx-auto px-4 lg:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 flex justify-center animate-fade-in">
            <img
              src={truephone}
              alt="Fuel Finder Mobile App"
              className="max-h-[80vh] object-contain rounded-3xl shadow-lg"
            />
          </div>

          <div className="order-1 lg:order-2 animate-fade-in animate-delay-200">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="text-fuelGreen-500">Fuel Finder,</span>
              <span className="text-fuelBlue-500"> Now in Your Pocket</span>
            </h2>

            <p className="text-gray-600 mb-8 text-lg">
              Stay ahead on the road with our easy-to-use mobile app. Find fuel
              stations in real time, check availability, and get directions —
              all from your phone.
            </p>

            <a
              href="#"
              className="inline-flex items-center bg-fuelGreen-500 hover:bg-fuelGreen-600 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                className="w-6 h-6 mr-2 fill-current"
              >
                <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
              </svg>
              Get it On Google Play
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileApp;
