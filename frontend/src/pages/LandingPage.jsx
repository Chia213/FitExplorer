import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import aiWorkoutGeneratorImagePreview from '../assets/ai-workoutgenerator-preview.png';
import workoutLogPreviewImage from '../assets/workout-log-preview.png';
import nutritionTrackingImage from '../assets/nutrition-tracking.png';
import progressTrackingImage from '../assets/progress-tracking.png';
import personalRecordsImage from '../assets/personal-records.png';
import fitnessCalculatorImage from '../assets/fitness-calculator.png';
import aiWorkoutGeneratorImage from '../assets/ai-workoutgenerator.png';
import logo from '../assets/Ronjasdrawing.png';
import profilePicture from '../assets/profile-picture.jpg';
import '../styles/landing-page.css';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const slideIn = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

// Floating animation for decorative elements
const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// Stats for the call to action section
const stats = [
  { value: "100+", label: "Exercises", icon: "💪" },
  { value: "AI", label: "Powered", icon: "🤖" },
  { value: "Free", label: "Atm", icon: "🎁" },
  { value: "24/7", label: "Support", icon: "🔧" }
];

// Featured programs inspired by BetterMe style
const featuredPrograms = [
  {
    id: 1,
    title: "AI Workout Generator",
    description: "personalized activities based on your fitness level",
    icon: "🏋️‍♀️",
    link: "/ai-workout-generator",
    image: aiWorkoutGeneratorImage,
    color: "from-blue-600 to-indigo-700"
  },
  {
    id: 2,
    title: "Nutrition Tracking",
    description: "simple meal planning to manage nutrition",
    icon: "🥗",
    link: "/nutrition",
    image: nutritionTrackingImage,
    color: "from-green-600 to-teal-700"
  },
  {
    id: 3,
    title: "Progress Tracking",
    description: "visualize results and celebrate achievements",
    icon: "📈",
    link: "/progress-tracker",
    image: progressTrackingImage,
    color: "from-purple-600 to-pink-700"
  }
];

// Professional feature card component
const ProgramCard = ({ program }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 group shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
  >
    {/* Image background */}
    {program.image && (
      <div className="relative h-48 overflow-hidden">
      <img 
        src={program.image} 
        alt={program.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>
    )}
    
    {/* Content */}
    <div className="p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          {program.title}
        </h3>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {program.description}
        </p>
      </div>
      
      <Link
        to={program.link}
        className="inline-flex items-center text-slate-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
      >
        Learn More
        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </Link>
    </div>
  </motion.div>
);

// Professional feature item component
const FeatureItem = ({ feature }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
  >
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-2xl mb-4 shadow-lg">
      {feature.icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{feature.description}</p>
  </motion.div>
);

// Simple CTA button component for reuse
const CtaButton = ({ to, children, primary = true }) => (
  <Link
    to={to}
    className={`${
      primary 
        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg" 
        : "bg-white hover:bg-gray-100 text-blue-800 border border-blue-100 shadow-md"
    } px-8 py-3 rounded-xl font-semibold transition-all duration-300 text-center`}
  >
    {children}
  </Link>
);

const BrightHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // App screen previews
  const appScreens = [
    { image: aiWorkoutGeneratorImagePreview, title: "AI Workout Generator" },
    { image: workoutLogPreviewImage, title: "Workout Log" },
    { image: nutritionTrackingImage, title: "Nutrition Tracking" },
    { image: progressTrackingImage, title: "Progress Tracking" },
    { image: personalRecordsImage, title: "Personal Records" },
    { image: fitnessCalculatorImage, title: "Fitness Calculator" }
  ];
  
  // Enhanced floating animation with more sophisticated movement
  const floatingAnimationSlow = {
    y: [0, -15, 0],
    rotate: [0, 2, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };
  
  const floatingAnimationMedium = {
    y: [0, -10, 0],
    rotate: [0, -1, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };
  
  const floatingAnimationFast = {
    y: [0, -5, 0],
    rotate: [0, 1, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };
  
  // Auto-advance the slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % appScreens.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, [appScreens.length]);
  
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.1),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 justify-center">
            {/* Text content */}
            <div className="w-full max-w-xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 leading-tight"
              >
                <span className="text-slate-900 dark:text-white">
                  Your Fitness Journey
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 mt-2">
                  Starts Here
                </span>
              </motion.h1>
        
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-slate-700 dark:text-slate-300 mb-8 leading-relaxed max-w-lg"
              >
                Professional-grade fitness tracking with AI-powered workout generation. 
                Track your progress, achieve your goals, and transform your body with confidence.
              </motion.p>
        
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Start Your Journey
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 text-center flex items-center justify-center"
                >
                  Learn More
                  <svg className="h-5 w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </Link>
              </motion.div>
            </div>
            
            {/* iPhone preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex justify-center w-full max-w-[280px]"
            >
              <div className="relative z-10 w-full perspective-1200 hover:rotate-y-3 transition-transform duration-500">
                {/* iPhone frame */}
                <div className="relative mx-auto bg-gray-900 dark:bg-black rounded-[35px] shadow-2xl dark:shadow-black/20" style={{ width: '280px', height: '570px', padding: '8px' }}>
                  {/* iPhone notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[0%] h-[20px] bg-gray-900 dark:bg-black rounded-b-xl z-20 flex justify-center items-end">
                    <div className="w-[50px] h-[6px] bg-gray-900 dark:bg-black rounded-[3px] mb-1"></div>
                  </div>
                  
                  {/* iPhone screen bezel */}
                  <div className="relative w-full h-full bg-gray-900 dark:bg-black overflow-hidden rounded-[28px] border-[2px] border-gray-800 dark:border-gray-950">
                    {/* Main visible slide */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="relative w-full h-full overflow-hidden"
                      >
                        <div className="w-full h-full flex items-center justify-center overflow-hidden">
                          <img 
                            src={appScreens[currentSlide].image}
                            alt={appScreens[currentSlide].title}
                            className={`h-full w-auto transition-transform duration-500 ${
                              currentSlide === 0 ? "scale-[1.2]" : "scale-100"
                            }`}
                            style={{
                              objectFit: "contain",
                              backgroundColor: "white"
                            }}
                          />
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  
                  {/* Side buttons */}
                  <div className="absolute right-[-2px] top-[85px] w-[2px] h-[25px] bg-gray-800 dark:bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute right-[-2px] top-[125px] w-[2px] h-[35px] bg-gray-800 dark:bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute right-[-2px] top-[170px] w-[2px] h-[35px] bg-gray-800 dark:bg-gray-700 rounded-l-sm"></div>
                  
                  {/* Power button */}
                  <div className="absolute left-[-2px] top-[125px] w-[2px] h-[35px] bg-gray-800 dark:bg-gray-700 rounded-r-sm"></div>
                </div>
                
                {/* iPhone model name */}
                <div className="text-center mt-4 text-gray-700 dark:text-gray-300 text-sm font-medium">FitExplorer Mobile</div>
                
                {/* Preview dots */}
                <div className="flex justify-center mt-4 gap-2">
                  {appScreens.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all transform hover:scale-110 ${
                        currentSlide === index 
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-400 dark:to-indigo-400 w-8 shadow-md" 
                          : "bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 w-2"
                      }`}
                      aria-label={`View ${appScreens[index].title}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Program showcase section with professional design
const ProgramShowcase = () => (
  <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12 sm:mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
        >
          <span className="text-slate-900 dark:text-white">Core Features</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed px-4"
        >
          Everything you need to achieve your fitness goals, powered by advanced technology and designed for real results.
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {featuredPrograms.map(program => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  </section>
);

// QR Code component using qrcode.react library
const QRCodeComponent = () => {
  const [expoUrl, setExpoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Generate the correct Expo Go URL
    try {
      if (typeof window !== 'undefined') {
        // Use the actual Expo app URL for Expo Go
        const expoAppUrl = `https://expo.dev/@fitexplorer/fitexplorerapp`;
        console.log('QR Code URL:', expoAppUrl);
        setExpoUrl(expoAppUrl);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error generating QR code URL:', error);
      setIsLoading(false);
    }
  }, []);
  
  // Don't render QR code until expoUrl is set
  if (isLoading || !expoUrl) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg relative">
        <div className="relative flex items-center justify-center h-[200px]">
          <div className="text-gray-500">Loading QR Code...</div>
        </div>
      </div>
    );
  }
  
  try {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg relative">
        <div className="relative">
          <QRCodeSVG
            value={expoUrl}
            size={200}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"H"}
            includeMargin={false}
            imageSettings={{
              src: logo,
              x: undefined,
              y: undefined,
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering QR code:', error);
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg relative">
        <div className="relative flex items-center justify-center h-[200px]">
          <div className="text-red-500">Error loading QR Code</div>
        </div>
      </div>
    );
  }
};

// Mobile app section with QR code
const QRCodeSection = () => {
  const [expoUrl, setExpoUrl] = useState('');
  
  useEffect(() => {
    // Generate the correct Expo Go URL
    try {
      if (typeof window !== 'undefined') {
        // Use the actual Expo app URL for Expo Go
        const expoAppUrl = `https://expo.dev/@fitexplorer/fitexplorerapp`;
        console.log('QR Code URL:', expoAppUrl);
        setExpoUrl(expoAppUrl);
      }
    } catch (error) {
      console.error('Error generating QR code URL:', error);
    }
  }, []);

  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.1),transparent)] opacity-70"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block mb-4 px-4 py-1.5 bg-blue-900/10 rounded-full backdrop-blur-sm border border-blue-700/20 text-sm font-medium text-blue-800">
                Mobile App
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 mb-4">Download FitExplorer Mobile App</h2>
              <p className="text-lg text-gray-700 mb-6">
                Get the full mobile app experience! Use Expo Go to download and run FitExplorer on your phone with native app features.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-4 mt-1 font-semibold">1</div>
                  <div>
                    <h3 className="text-blue-900 font-medium mb-1">Download Expo Go</h3>
                    <p className="text-gray-600">Install Expo Go from App Store (iOS) or Google Play (Android)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-4 mt-1 font-semibold">2</div>
                  <div>
                    <h3 className="text-blue-900 font-medium mb-1">Scan the QR Code</h3>
                    <p className="text-gray-600">Scan the QR code below to get instructions for Expo Go</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-4 mt-1 font-semibold">3</div>
                  <div>
                    <h3 className="text-blue-900 font-medium mb-1">Start Using the App</h3>
                    <p className="text-gray-600">FitExplorer will load in Expo Go with full mobile features</p>
                  </div>
                </div>
              </div>
              
              {/* Alternative access methods */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-blue-900 font-medium mb-2">Alternative Access Methods:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• <strong>Web Browser:</strong> Visit fitexplorer.se directly in your mobile browser</p>
                  <p>• <strong>PWA:</strong> Add to home screen for app-like experience</p>
                  <p>• <strong>Expo Go:</strong> Best experience with native mobile features</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg relative w-fit mx-auto"
            >
              <QRCodeComponent />
              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  Scan with Expo Go App
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Opens FitExplorer in Expo Go
                </p>
                {expoUrl && (
                  <p className="text-blue-500 text-xs mt-2 font-mono break-all">
                    {expoUrl}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Professional journey section
const JourneySection = () => (
  <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent_50%)]"></div>
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-blue-600/20 dark:bg-blue-600/20 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 mb-6 border border-blue-500/30"
          >
            MY STORY
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8"
          >
            From Passion to Purpose
          </motion.h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/95 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl p-6 sm:p-12 border border-slate-300/60 dark:border-slate-700/50 shadow-2xl relative"
        >
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 leading-relaxed text-slate-800 dark:text-slate-200">
            FitExplorer started as a personal hobby project born from my genuine love for fitness and the frustration I felt with existing fitness apps. As someone who incorporates fitness into my daily life, I noticed that every app I tried was missing something essential that perfect balance of simplicity and functionality.
          </p>
          
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 leading-relaxed text-slate-800 dark:text-slate-200">
            When I had the opportunity to create a fitness app, I combined my passion for fitness with the knowledge I gained from school to bring this vision to life. I wanted to build the simplest solution that addressed the gaps I experienced in every other fitness app I had used.
          </p>
          
          <p className="text-lg sm:text-xl leading-relaxed text-slate-800 dark:text-slate-200">
            I'm incredibly proud of what FitExplorer has become, and I'm committed to continuously developing and improving it to make it even better. This isn't just an app it's a reflection of my dedication to fitness and my desire to create something truly useful for fellow fitness enthusiasts.
          </p>
          
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center">
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white font-bold text-2xl mb-6 sm:mb-0 sm:mr-8 shadow-xl overflow-hidden border-4 border-white dark:border-slate-800">
              <img 
                src={profilePicture} 
                alt="Chia Ranchber" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <div className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Chia Ranchber</div>
              <div className="text-slate-600 dark:text-slate-300">Developer and Creator</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Professional features section
const MoreFeaturesSection = () => {
  const moreFeatures = [
    {
      id: 1,
      title: "Exercise Library",
      description: "Access 500+ exercises with form guides",
      icon: "📚",
      link: "/routines"
    },
    {
      id: 2,
      title: "Personal Records",
      description: "Track and celebrate your achievements",
      icon: "🏆",
      link: "/personal-records"
    },
    {
      id: 3,
      title: "Fitness Calculators",
      description: "BMI, TDEE, and body fat calculators",
      icon: "🧮",
      link: "/fitness-calculator"
    },
    {
      id: 4,
      title: "Workout Log",
      description: "Record your training progress",
      icon: "📝",
      link: "/workout-log"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-slate-900 dark:text-white"
          >
            Complete Fitness Solution
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto px-4"
          >
            Everything you need to track, improve, and achieve your fitness goals in one powerful platform.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {moreFeatures.map(feature => (
            <FeatureItem key={feature.id} feature={feature} />
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <Link
            to="/signup"
            className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-10 py-4 rounded-lg font-semibold text-lg transition-all duration-300 inline-block shadow-lg"
          >
            Start Your Journey
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Professional call to action section
const CallToAction = () => (
  <section className="py-24 relative overflow-hidden bg-slate-900 dark:bg-slate-800">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_70%)]"></div>
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white">
            Ready to Transform Your Fitness?
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Join thousands of fitness enthusiasts who are already achieving their goals with our professional-grade platform. Start your transformation today.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center bg-white hover:bg-slate-100 text-slate-900 px-12 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg"
            >
              Get Started Free
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  </section>
);

const LandingPage = () => {
  // This handles the initial page scroll and helps ensure alerts don't display twice
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Clear any potential duplicate alerts
    const clearExistingAlerts = () => {
      // If you have a way to identify/clear alerts, add it here
      // This depends on how your alert system is implemented
      // For example, if you use a context for alerts:
      // alertContext.clearAll();
    };
    
    clearExistingAlerts();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
      {/* Professional hero section */}
      <BrightHero />
      
      {/* Core features showcase */}
      <ProgramShowcase />
      
      {/* Mission section */}
      <JourneySection />
      
      {/* Complete fitness solution */}
      <MoreFeaturesSection />
      
      {/* Mobile app section with QR code */}
      <QRCodeSection />
      
      {/* Call to action */}
      <CallToAction />
    </div>
  );
};

export default LandingPage; 