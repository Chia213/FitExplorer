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

const TestimonialCard = ({ testimonial }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="glass-effect rounded-2xl p-6"
  >
    <div className="flex items-center mb-4">
      <img
        src={testimonial.avatar}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full mr-4"
      />
      <div>
        <h4 className="font-semibold text-white">{testimonial.name}</h4>
        <p className="text-sm text-neutral-400">{testimonial.title}</p>
      </div>
    </div>
    <p className="text-neutral-300 italic">{testimonial.quote}</p>
  </motion.div>
);

const CallToAction = () => (
  <section className="py-20 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-accent-900"></div>
    <div className="absolute inset-0 bg-[url('/src/assets/pattern.svg')] opacity-10"></div>
    
    <div className="container-modern relative z-10">
      <div className="max-w-3xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-6"
        >
          Ready to Transform Your
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
            Fitness Journey?
          </span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-neutral-300 mb-8"
        >
          Join thousands of users who have already transformed their lives with FitExplorer.
          Start your 14-day free trial today!
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
            className="btn-primary text-lg px-8 py-4"
          >
            Start Free Trial
          </Link>
          <Link
            to="/about"
            className="glass-effect text-white text-lg px-8 py-4 rounded-lg hover:bg-white/20 transition-colors duration-300"
          >
            Learn More
          </Link>
        </motion.div>
      </div>
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
      <section className="py-20">
        <div className="container-modern">
          <div className="text-center mb-16">
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
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      <CallToAction />
    </div>
  );
};

export default LandingPage; 