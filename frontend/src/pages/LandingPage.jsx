import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import titanImage from '../assets/titan.png';
import femaleTitanImage from '../assets/female-titan.png';
import aiWorkoutGeneratorImage from '../assets/ai-workoutgenerator.png';
import nutritionTrackingImage from '../assets/nutrition-tracking.png';
import progressTrackingImage from '../assets/progress-tracking.png';
import personalRecordsImage from '../assets/personal-records.png';
import fitnessCalculatorImage from '../assets/fitness-calculator.png';
import '../styles/landing-page.css';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Stats for the call to action section
const stats = [
  { value: "500+", label: "Exercises" },
  { value: "AI", label: "Powered" },
  { value: "Free", label: "14-Day Trial" },
  { value: "24/7", label: "Support" }
];

const AnimatedFeatureCard = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.03, y: -5 }}
    className="bg-gradient-to-br from-neutral-800/80 to-neutral-900/80 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-6 h-full transition-all duration-300 relative group overflow-hidden"
    style={{ boxShadow: "0 0 20px rgba(0,0,0,0.2)" }}
  >
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700"></div>
    
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl shadow-lg">
        {feature.icon}
      </div>
      <h3 className="text-xl font-bold ml-4 bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">{feature.title}</h3>
    </div>
    
    <p className="text-neutral-300 mb-6 relative z-10">{feature.description}</p>
    
    <Link to={feature.link} className="inline-flex items-center text-primary-400 hover:text-primary-300 transition-colors group-hover:translate-x-2 transition-transform duration-300">
      Explore <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </Link>
  </motion.div>
);

const CallToAction = ({ stats }) => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-neutral-900 to-accent-900"></div>
    <div className="absolute inset-0 bg-gradient-radial from-transparent to-black/40 opacity-10"></div>
    
    {/* Animated background elements */}
    <motion.div 
      className="absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-primary-500/10 backdrop-blur-3xl"
      animate={{ y: [0, -50, 0], x: [0, 30, 0], rotate: [0, 15, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <motion.div 
      className="absolute bottom-1/4 -right-24 w-96 h-96 rounded-full bg-accent-500/10 backdrop-blur-3xl"
      animate={{ y: [0, 60, 0], x: [0, -40, 0], rotate: [0, -15, 0] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <motion.div
      className="absolute top-2/3 left-1/4 w-64 h-64 rounded-full bg-purple-500/10 backdrop-blur-3xl"
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <div className="container-modern relative z-10">
      <motion.div 
        className="max-w-4xl mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-10 md:p-14 border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full py-2 px-8 shadow-2xl">
          <span className="text-white font-bold tracking-wider">LIMITED TIME OFFER</span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-2 text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-300">
              Unleash Your Fitness
            </span>
          </h2>
          <h2 className="text-4xl md:text-5xl font-extrabold">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-accent-400">
              Potential Today
            </span>
          </h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-xl text-neutral-300 max-w-2xl mx-auto mt-6"
          >
            Get exclusive access to our AI-powered workout system, progress tracking, and nutrition plans in one seamless platform.
          </motion.p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/signup"
            className="relative overflow-hidden group bg-gradient-to-r from-primary-600 to-primary-500 text-white text-lg px-10 py-4 rounded-xl shadow-xl flex items-center justify-center"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-accent-500 to-accent-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></span>
            <span className="relative z-10 font-bold tracking-wide flex items-center">
              Start Free 14-Day Trial
              <motion.svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 ml-2" 
                viewBox="0 0 20 20" 
                fill="currentColor"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </motion.svg>
            </span>
          </Link>
          <Link
            to="/about"
            className="bg-white/10 backdrop-blur-sm text-white text-lg px-10 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 font-semibold tracking-wide"
          >
            Learn More
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
          className="mt-12 pt-8 border-t border-white/10"
        >
          <div className="text-center mb-6">
            <span className="text-sm font-medium text-neutral-400 uppercase tracking-wider">Trusted by fitness enthusiasts worldwide</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + (index * 0.1) }}
                className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-400 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  </section>
);

const LandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  useEffect(() => {
    // Only scroll to top on initial page load, not when changing features
    if (activeFeature === 0) {
      window.scrollTo(0, 0);
    }
    
    // Auto-rotate through features
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setActiveFeature(prev => (prev + 1) % features.length);
      }, 4000);
    }
    
    return () => clearInterval(interval);
  }, [isAutoPlaying, activeFeature]);

  const features = [
    {
      id: 1,
      title: "AI Workout Generator",
      description: "Get personalized AI workouts based on your goals, equipment, and experience level that adapt as you progress.",
      icon: "🏋️‍♀️",
      link: "/ai-workout-generator",
      color: "bg-blue-500",
      bgGradient: "from-blue-600 to-indigo-700",
      image: aiWorkoutGeneratorImage,
      specialStyle: "h-full object-cover"
    },
    {
      id: 2,
      title: "Workout Log & Routines",
      description: "Track your training progress and create personalized workout plans. Log exercises, record sets, reps, and weights with our intuitive interface for a complete history of your fitness journey.",
      icon: "📝",
      link: "/workout-log",
      color: "bg-orange-500",
      bgGradient: "from-orange-500 to-amber-600",
      image: titanImage,
      hasSplitView: true,
      splitViewLinks: [
        { title: "Workout Log", subtitle: "Track your exercises", link: "/workout-log", icon: "📊" },
        { title: "Routines", subtitle: "Build custom plans", link: "/routines", icon: "🔄" }
      ]
    },
    {
      id: 3,
      title: "Nutrition Tracking",
      description: "Track meals, calories, and macros with our smart nutrition system that provides personalized recommendations.",
      icon: "🥗",
      link: "/nutrition",
      color: "bg-green-500",
      bgGradient: "from-green-600 to-teal-700",
      image: nutritionTrackingImage,
      specialStyle: "h-auto object-contain max-h-80"
    },
    {
      id: 4,
      title: "Progress Tracking",
      description: "Visualize your fitness journey with detailed progress graphs, body measurements, and performance metrics.",
      icon: "📈",
      link: "/progress-tracker",
      color: "bg-purple-500",
      bgGradient: "from-purple-600 to-pink-700",
      image: progressTrackingImage,
      specialStyle: "h-auto object-contain max-h-80"
    },
    {
      id: 5,
      title: "Exercise Library",
      description: "Access 500+ exercises with step-by-step instructions, video demonstrations, and proper form guidance.",
      icon: "📚",
      link: "/routines",
      color: "bg-amber-500",
      bgGradient: "from-amber-600 to-orange-700",
      image: null,
      hasBothImages: true
    },
    {
      id: 6,
      title: "Personal Records",
      description: "Track and celebrate your personal bests with automatic PR detection and achievement unlocks.",
      icon: "🏆",
      link: "/personal-records",
      color: "bg-red-500",
      bgGradient: "from-red-600 to-rose-700",
      image: personalRecordsImage,
      specialStyle: "h-auto object-contain max-h-80"
    },
    {
      id: 7,
      title: "Fitness Calculators",
      description: "Optimize your fitness journey with BMI, TDEE, body fat, and other essential calculators in one place.",
      icon: "🧮",
      link: "/fitness-calculator",
      color: "bg-teal-500",
      bgGradient: "from-teal-600 to-cyan-700",
      image: fitnessCalculatorImage,
      specialStyle: "h-auto object-contain max-h-80"
    }
  ];

  return (
    <div className="bg-neutral-900 text-white">
      <HeroSection />
      <FeaturesSection />
      
      {/* Feature Highlights - Instead of testimonials */}
      <section className="py-20 bg-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-neutral-800 to-neutral-900 opacity-80"></div>
        <div className="container-modern relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-2 px-4 py-1.5 bg-primary-900/50 rounded-full backdrop-blur-sm border border-primary-700/30"
            >
              <span className="text-sm font-medium text-primary-400">Feature Highlights</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Everything You Need
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 max-w-2xl mx-auto"
            >
              Explore our most popular features designed to transform your fitness journey
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.slice(0, 6).map((feature, index) => (
              <AnimatedFeatureCard key={feature.id} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <CallToAction stats={stats} />
    </div>
  );
};

export default LandingPage; 