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

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Stats for the call to action section
const stats = [
  { value: "500+", label: "Exercises" },
  { value: "AI", label: "Powered" },
  { value: "Free", label: "14-Day Trial" },
  { value: "24/7", label: "Support" }
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
    className="relative overflow-hidden rounded-3xl aspect-[4/3] group"
  >
    {/* Background image with overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/80 z-10"></div>
    <div className={`absolute inset-0 bg-gradient-to-br ${program.color} opacity-40 z-0`}></div>
    
    {/* Image background */}
    {program.image && (
      <img 
        src={program.image} 
        alt={program.title} 
        className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
      />
    )}
    
    {/* Content */}
    <div className="relative z-20 flex flex-col justify-between h-full p-8">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">
          {program.title}
        </h3>
        <p className="text-lg text-white/80">
          {program.description}
        </p>
      </div>
      
      <Link
        to={program.link}
        className="mt-6 w-full bg-white/90 hover:bg-white text-neutral-900 font-bold py-3 px-6 rounded-xl text-center transition-all duration-300"
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
    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-500/30 flex items-center justify-center text-2xl mb-4">
      {feature.icon}
    </div>
    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
    <p className="text-neutral-300 text-sm">{feature.description}</p>
  </motion.div>
);

// Simple CTA button component for reuse
const CtaButton = ({ to, children, primary = true }) => (
  <Link
    to={to}
    className={`${
      primary 
        ? "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white" 
        : "bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20"
    } px-8 py-3 rounded-xl font-semibold transition-all duration-300 text-center`}
  >
    {children}
  </Link>
);

const SimplifiedHero = () => (
  <section className="min-h-[80vh] bg-gradient-to-b from-neutral-900 to-neutral-800 flex items-center relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-5"></div>
    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary-500/10 to-transparent"></div>
    <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-accent-500/10 to-transparent"></div>
    
    <div className="container mx-auto px-4 py-20 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-6xl font-bold mb-6"
        >
          <span className="text-white">Fun and Simple Fitness:</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mt-2">
            personalized activities to cover your wellness needs
          </span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto"
        >
          Experience a smarter way to fitness with AI-powered workouts, intuitive tracking, 
          and personalized plans designed for your unique goals.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <CtaButton to="/signup">Get Started</CtaButton>
          <CtaButton to="/about" primary={false}>Learn More</CtaButton>
        </motion.div>
      </div>
    </div>
  </section>
);

// Program showcase section inspired by BetterMe
const ProgramShowcase = () => (
  <section className="py-20 bg-neutral-900">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          <span className="text-white">Featured Programs</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-lg text-neutral-300 max-w-2xl mx-auto"
        >
          Choose from our most popular fitness solutions
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredPrograms.map(program => (
          <ProgramCard key={program.id} program={program} />
        ))}
      </div>
    </div>
  </section>
);

// Mobile app section with QR code
const QRCodeSection = () => (
  <section className="py-16 relative overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(79,70,229,0.1),transparent)] opacity-70"></div>
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block mb-4 px-4 py-1.5 bg-primary-900/50 rounded-full backdrop-blur-sm border border-primary-700/30 text-sm font-medium text-primary-400">
              Mobile App
            </span>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Install FitExplorer on Your Device
            </h2>
            
            <p className="text-lg text-neutral-300 mb-8">
              Get the full FitExplorer experience on your phone. Scan the QR code to install directly to your home screen.
            </p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <div className="bg-primary-500/20 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white">Works offline – train anywhere</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary-500/20 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white">Better performance on mobile devices</span>
              </li>
              <li className="flex items-center">
                <div className="bg-primary-500/20 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white">Get mobile-specific workout features</span>
              </li>
            </ul>
          </motion.div>
        </div>
        
        <div className="md:w-1/2 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white p-10 rounded-3xl shadow-2xl"
          >
            <div className="bg-white w-64 h-64 flex items-center justify-center rounded-xl border-8 border-neutral-100">
              <span className="text-black font-bold text-lg text-center">QR Code<br/>Here</span>
            </div>
            <p className="text-center mt-4 text-neutral-600 font-medium">
              Scan with your phone's camera
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

// Additional features section
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
    <section className="py-16 bg-neutral-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold mb-3 text-white"
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
          <CtaButton to="/signup">
            Try All Features
          </CtaButton>
        </motion.div>
      </div>
    </section>
  );
};

// Call to action section
const CallToAction = () => (
  <section className="py-20 relative overflow-hidden bg-gradient-to-br from-primary-900 via-neutral-900 to-accent-900">
    <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-5"></div>
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="mb-2 inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium text-white">
            LIMITED TIME OFFER
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Unleash Your Fitness Potential Today
          </h2>
          
          <p className="text-lg text-neutral-300 mb-8">
            Get exclusive access to our AI-powered workout system, progress tracking, and nutrition plans in one seamless platform.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl">
                <div className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                  {stat.value}
                </div>
                <div className="text-sm text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </div>
          
          <CtaButton to="/signup">
            Start Free 14-Day Trial
          </CtaButton>
        </motion.div>
      </div>
    </div>
  </section>
);

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-neutral-900 text-white">
      {/* BetterMe-inspired clean, focused hero section */}
      <SimplifiedHero />
      
      {/* Program showcase inspired by BetterMe's clean card layout */}
      <ProgramShowcase />
      
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