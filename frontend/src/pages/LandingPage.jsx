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

const TestimonialCard = ({ testimonial, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-6 h-full hover:shadow-lg transition-all duration-300 relative group"
    style={{ boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05) inset" }}
  >
    <div className="absolute -top-1 -left-1 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
      {index + 1}
    </div>
    <div className="absolute -right-3 -bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <div className="text-5xl text-neutral-700 font-serif">"</div>
    </div>
    <div className="pt-6 pb-6">
      <p className="text-neutral-300 italic mb-6 relative">
        <span className="text-2xl text-primary-400 absolute -top-3 -left-1">"</span>
        {testimonial.quote}
        <span className="text-2xl text-primary-400 absolute -bottom-3 -right-1">"</span>
      </p>
      <div className="flex items-center">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full mr-4 border-2 border-white/10 object-cover"
        />
        <div>
          <h4 className="font-semibold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
            {testimonial.name}
          </h4>
          <p className="text-sm text-neutral-400">{testimonial.title}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

const CallToAction = () => (
  <section className="py-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-primary-800 to-accent-800"></div>
    <div className="absolute inset-0 bg-[url('/src/assets/pattern.svg')] opacity-10"></div>
    
    {/* Background decorations */}
    <motion.div 
      className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-white/5 backdrop-blur-lg"
      animate={{ y: [0, -30, 0], rotate: [0, 5, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <motion.div 
      className="absolute bottom-1/4 -right-24 w-80 h-80 rounded-full bg-white/5 backdrop-blur-lg"
      animate={{ y: [0, 30, 0], rotate: [0, -5, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
    
    <div className="container-modern relative z-10">
      <motion.div 
        className="max-w-3xl mx-auto bg-black/20 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-white/10 shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full py-2 px-6 shadow-lg">
          <span className="text-white font-bold">Join Today</span>
        </div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6 text-center"
        >
          Ready to Transform Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mt-1">
            Fitness Journey?
          </span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-neutral-300 mb-8 text-center"
        >
          Join thousands of users who have already transformed their lives with FitExplorer.
          Start your 14-day free trial today with no credit card required!
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            to="/signup"
            className="relative overflow-hidden group bg-gradient-to-r from-primary-600 to-primary-500 text-white text-lg px-8 py-4 rounded-lg shadow-lg flex items-center justify-center"
          >
            <span className="relative z-10 font-semibold">Start Free Trial</span>
            <span className="absolute inset-0 bg-gradient-to-r from-accent-500 to-accent-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 relative z-10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link
            to="/about"
            className="bg-white/10 backdrop-blur-sm text-white text-lg px-8 py-4 rounded-lg hover:bg-white/20 transition-colors duration-300 border border-white/20"
          >
            Learn More
          </Link>
        </motion.div>
        
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap justify-center gap-4">
          {[
            { icon: "🎯", text: "Personalized Workouts" },
            { icon: "📊", text: "Progress Tracking" },
            { icon: "🥗", text: "Nutrition Plans" },
            { icon: "📱", text: "Mobile Optimized" }
          ].map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + (index * 0.1) }}
              className="flex items-center text-sm text-neutral-300"
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>
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

  const testimonials = [
    {
      name: "Sarah K.",
      title: "Fitness Enthusiast",
      quote: "The AI workout generator is incredible! It adapts to my progress and keeps challenging me with new routines.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Michael T.",
      title: "Weight Loss Journey",
      quote: "The nutrition tracking paired with workout planning has completely transformed my approach to fitness.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Emma R.",
      title: "Working Professional",
      quote: "As a busy professional, I love how this app streamlines everything. The progress tracking keeps me motivated.",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg"
    }
  ];

  const stats = [
    { value: "500+", label: "Exercises" },
    { value: "New", label: "AI Workout Generator" },
    { value: "Free", label: "14-Day Trial" },
    { value: "24/7", label: "Progress Tracking" }
  ];

  return (
    <div className="bg-neutral-900 text-white">
      <HeroSection />
      <FeaturesSection />
      
      {/* Testimonials Section */}
      <section className="py-20 bg-neutral-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-5"></div>
        <div className="container-modern relative z-10">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block mb-2 px-4 py-1.5 bg-accent-900/50 rounded-full backdrop-blur-sm border border-accent-700/30"
            >
              <span className="text-sm font-medium text-accent-400">User Experiences</span>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              What Our Users Say
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 max-w-2xl mx-auto"
            >
              Join thousands of satisfied users who have transformed their fitness journey with FitExplorer
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      <CallToAction />
    </div>
  );
};

export default LandingPage; 