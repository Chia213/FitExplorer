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

// Simplified feature card component inspired by BetterMe's clean design
const ProgramCard = ({ program }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative overflow-hidden rounded-3xl aspect-[4/3] group shadow-lg"
  >
    {/* Background image with overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/60 z-10"></div>
    <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-70 z-0`}></div>
    
    {/* Image background */}
    {program.image && (
      <img 
        src={program.image} 
        alt={program.title} 
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
      />
    )}
    
    {/* Content */}
    <div className="relative z-20 flex flex-col justify-between h-full p-8">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {program.title}
        </h3>
        <p className="text-lg text-white/90">
          {program.description}
        </p>
      </div>
      
      <Link
        to={program.link}
        className="mt-6 w-full bg-white hover:bg-blue-50 text-blue-900 font-bold py-3 px-6 rounded-xl text-center transition-all duration-300 shadow-md"
      >
        Get Started
      </Link>
    </div>
  </motion.div>
);

// Secondary features in the BetterMe style
const FeatureItem = ({ feature }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="flex flex-col items-center text-center p-4"
  >
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-2xl mb-4 shadow-md">
      {feature.icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-blue-900 dark:text-white">{feature.title}</h3>
    <p className="text-gray-700 dark:text-gray-300 text-sm">{feature.description}</p>
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
    <section className="min-h-[80vh] flex items-center relative overflow-hidden py-16 bg-white dark:bg-gray-900">
      {/* Gradient background that changes with theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-indigo-400 to-purple-400 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 z-0 opacity-100 dark:opacity-90"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-row items-center gap-16 justify-center">
            {/* Text content */}
            <div className="w-full max-w-xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-6xl font-bold mb-8"
              >
                <span className="text-gray-900 dark:text-white drop-shadow-sm">
                  Fun & Simple Fitness
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mt-2 drop-shadow-sm">
                  Built from personal need. Designed for everyone.
                </span>
              </motion.h1>
        
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-xl text-gray-700 dark:text-gray-200 mb-6 leading-relaxed"
              >
                I created this app because I wanted a fitness experience that felt smarter, more intuitive, and truly personal.
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl text-gray-700 dark:text-gray-200 mb-10 leading-relaxed"
              >
                Now, with AI-powered workouts, seamless tracking, and goal-focused plans — you can experience the kind of support I always wished existed.
              </motion.p>
        
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-5"
              >
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 dark:from-emerald-600 dark:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-emerald-400 hover:to-teal-400 dark:hover:from-emerald-500 dark:hover:to-teal-500 transition-all duration-300 text-center relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Get Started
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold rounded-xl shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 text-center flex items-center justify-center"
                >
                  Learn More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </motion.div>
            </div>
            
            {/* iPhone preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex justify-center w-full max-w-[320px]"
            >
              <div className="relative z-10 w-full perspective-1200 hover:rotate-y-3 transition-transform duration-500">
                {/* iPhone frame */}
                <div className="relative mx-auto bg-gray-900 dark:bg-black rounded-[40px] shadow-2xl dark:shadow-black/20" style={{ width: '320px', height: '650px', padding: '9px' }}>
                  {/* iPhone notch */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[0%] h-[24px] bg-gray-900 dark:bg-black rounded-b-xl z-20 flex justify-center items-end">
                    <div className="w-[60px] h-[8px] bg-gray-900 dark:bg-black rounded-[4px] mb-1"></div>
                  </div>
                  
                  {/* iPhone screen bezel */}
                  <div className="relative w-full h-full bg-gray-900 dark:bg-black overflow-hidden rounded-[32px] border-[2px] border-gray-800 dark:border-gray-950">
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
                  <div className="absolute right-[-2px] top-[100px] w-[3px] h-[30px] bg-gray-800 dark:bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute right-[-2px] top-[150px] w-[3px] h-[40px] bg-gray-800 dark:bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute right-[-2px] top-[200px] w-[3px] h-[40px] bg-gray-800 dark:bg-gray-700 rounded-l-sm"></div>
                  
                  {/* Power button */}
                  <div className="absolute left-[-2px] top-[150px] w-[3px] h-[40px] bg-gray-800 dark:bg-gray-700 rounded-r-sm"></div>
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

// Program showcase section with brighter design
const ProgramShowcase = () => (
  <section className="py-20 bg-white">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          <span className="text-blue-900">Featured Programs</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg text-gray-600 max-w-2xl mx-auto"
        >
          Choose from our most popular fitness solutions
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredPrograms.map(program => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  </section>
);

// QR Code component using qrcode.react library
const QRCodeComponent = () => {
  const [currentUrl, setCurrentUrl] = useState('https://fitexplorer.se');
  
  useEffect(() => {
    // Get the current URL to encode in the QR code
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin);
    }
  }, []);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg relative">
      <div className="relative">
        <QRCodeSVG
          value={currentUrl}
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
};

// Mobile app section with QR code
const QRCodeSection = () => {
  return (
    <section className="py-16 relative overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.1),transparent)] opacity-70"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block mb-4 px-4 py-1.5 bg-blue-900/10 rounded-full backdrop-blur-sm border border-blue-700/20 text-sm font-medium text-blue-800">
                Mobile App
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Install FitExplorer on Your Phone</h2>
              <p className="text-lg text-gray-700 mb-6">
                Get the same experience as a native app! Add FitExplorer to your home screen for quick access.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-4 mt-1 font-semibold">1</div>
                  <div>
                    <h3 className="text-blue-900 font-medium mb-1">Scan the QR Code</h3>
                    <p className="text-gray-600">Use your phone's camera to scan the code</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-4 mt-1 font-semibold">2</div>
                  <div>
                    <h3 className="text-blue-900 font-medium mb-1">Open in Browser</h3>
                    <p className="text-gray-600">Visit the link in Safari (iOS) or Chrome (Android)</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 mr-4 mt-1 font-semibold">3</div>
                  <div>
                    <h3 className="text-blue-900 font-medium mb-1">Add to Home Screen</h3>
                    <p className="text-gray-600">Use the "Add to Home Screen" option in your browser</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-6 rounded-xl shadow-lg relative w-fit mx-auto"
            >
              <QRCodeComponent />
              <div className="mt-4 text-center">
                <p className="text-gray-600 text-sm">
                  FitExplorer Web App
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// My journey section
const JourneySection = () => (
  <section className="py-16 bg-gradient-to-r from-blue-900 to-indigo-900 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
    <div className="absolute top-0 left-0 w-full h-full bg-[url('/src/assets/grid-pattern.svg')] opacity-5"></div>
    
    {/* Added 3D effect elements */}
    <motion.div 
      animate={floatingAnimation} 
      className="absolute top-20 right-[10%] w-24 h-24 rounded-xl bg-blue-600/10 backdrop-blur-sm rotate-12"
    ></motion.div>
    <motion.div 
      animate={{...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.5 }}} 
      className="absolute bottom-20 left-[15%] w-20 h-20 rounded-full bg-purple-600/10 backdrop-blur-sm"
    ></motion.div>
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium text-blue-200 mb-4 border border-white/20 backdrop-blur-sm shadow-lg"
          >
            MY JOURNEY
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Why I Created FitExplorer
          </motion.h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20 shadow-xl relative transform hover:-translate-y-1 transition-transform duration-300"
        >
          {/* Decorative quote mark */}
          <div className="absolute -top-6 -left-2 text-8xl text-white/10 font-serif">"</div>
          
          <p className="text-xl mb-6 leading-relaxed relative z-10">
            "I've always been passionate about fitness, but I found existing apps either too complex or too limited. I wanted a single solution that could provide intelligent workout suggestions, track my progress, and adapt to my changing needs."
          </p>
          
          <p className="text-xl mb-6 leading-relaxed relative z-10">
            "FitExplorer is the app I wish I had when I started my fitness journey — combining AI technology with intuitive tracking and a supportive community. I built it to solve real problems and make fitness more accessible for everyone."
          </p>
          
          <p className="text-xl leading-relaxed relative z-10">
            "Whether you're just starting out or looking to reach new heights in your fitness journey, FitExplorer is designed to be the companion that helps you achieve your goals."
          </p>
          
          <div className="mt-8 flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-xl mr-4 shadow-lg border-2 border-white/30">
              F
            </div>
            <div>
              <div className="font-bold text-lg">Founder</div>
              <div className="text-blue-200">FitExplorer</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Additional features section with brighter design
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold mb-3 text-blue-900"
          >
            More Ways to Improve Your Fitness
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {moreFeatures.map(feature => (
            <FeatureItem key={feature.id} feature={feature} />
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 inline-block shadow-lg border-2 border-blue-500"
          >
            Try All Features
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// Call to action section with brighter design
const CallToAction = () => (
  <section className="py-20 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700">
    <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-10"></div>
    
    {/* 3D floating elements */}
    <motion.div 
      animate={floatingAnimation} 
      className="absolute top-20 right-[10%] w-32 h-32 rounded-full bg-blue-500/10 backdrop-blur-sm z-0"
    ></motion.div>
    <motion.div 
      animate={{...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 0.7 }}} 
      className="absolute bottom-20 left-[10%] w-24 h-24 rounded-full bg-indigo-500/10 backdrop-blur-sm z-0"
    ></motion.div>
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">
            Unleash Your Fitness Potential Today
          </h2>
          
          <p className="text-lg text-white/90 mb-8 leading-relaxed">
            Get exclusive access to our AI-powered workout system, progress tracking, and nutrition plans in one seamless platform.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 mx-auto mb-2 text-xl">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to="/signup"
              className="group bg-white hover:bg-blue-50 text-blue-800 px-8 py-4 rounded-xl font-semibold transition-all duration-300 text-center shadow-lg inline-flex items-center gap-2"
            >
            Join Us Now!
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200 transition-colors duration-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </motion.div>
          
          {/* Trust indicators */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-white/80 text-sm">
            
          </div>
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
    <div className="bg-white text-gray-900">
      {/* Bright, welcoming hero section */}
      <BrightHero />
      
      {/* Program showcase with brighter design */}
      <ProgramShowcase />
      
      {/* My Journey section */}
      <JourneySection />
      
      {/* Additional features in a simplified layout */}
      <MoreFeaturesSection />
      
      {/* Mobile app section with QR code */}
      <QRCodeSection />
      
      {/* Call to action */}
      <CallToAction />
    </div>
  );
};

export default LandingPage; 