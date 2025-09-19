import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import AnimatedPhone from '../components/AnimatedPhone';
import logo from '../assets/Ronjasdrawing.png';
import profilePicture from '../assets/profile-picture.jpg';
import aiWorkoutGeneratorScreenshot from '../assets/ai-workout-generator-screenshot.png';
import muscleLibraryImage from '../assets/muscle-library-feature.jpg';
import '../styles/landing-page.css';

// Import new modern design components
import Header from "../components/Header";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import Footer from "../components/Footer";
import { useTheme } from "../hooks/useTheme";

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
    title: "Muscle Library",
    description: "Complete anatomical guide with detailed muscle information, exercises, and proper form instructions for every muscle group.",
    icon: "🧬",
    link: "/muscle-guide",
    image: muscleLibraryImage,
    color: "gradient-primary"
  }
];

// Professional feature card component
const ProgramCard = ({ program }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-card group shadow-lg hover:shadow-xl transition-all duration-300 border border-border"
  >
    {/* Image or Icon background */}
    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
      {program.image ? (
        <>
          <img 
            src={program.image} 
            alt={program.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"></div>
        </>
      ) : (
        <div className={`w-full h-full ${program.color} flex items-center justify-center`}>
          <span className="text-6xl sm:text-7xl md:text-8xl opacity-80">{program.icon}</span>
        </div>
      )}
    </div>
    
    {/* Content */}
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-card-foreground mb-2 sm:mb-3">
          {program.title}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {program.description}
        </p>
      </div>
      
      <Link
        to={program.link}
        className="inline-flex items-center text-sm sm:text-base text-card-foreground font-semibold hover:text-primary transition-colors duration-200"
      >
        Learn More
        <svg className="ml-2 w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </Link>
    </div>
  </motion.div>
);

// Simple CTA button component for reuse
const CtaButton = ({ to, children, primary = true }) => (
  <Link
    to={to}
    className={`${
      primary 
        ? "gradient-primary text-primary-foreground shadow-glow hover:shadow-glow hover:scale-105" 
        : "bg-card hover:bg-accent text-card-foreground hover:text-accent-foreground border border-border shadow-md"
    } px-8 py-3 rounded-xl font-semibold transition-all duration-300 text-center`}
  >
    {children}
  </Link>
);

const BrightHero = () => {
  
  return (
    <section className="min-h-screen flex items-center relative overflow-hidden gradient-hero">
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16 justify-center">
            {/* Text content */}
            <div className="w-full max-w-xl">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight"
              >
                <span className="text-foreground">
                  Your Fitness Journey
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent mt-1 sm:mt-2">
                  Starts Here
                </span>
              </motion.h1>
        
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-lg"
              >
                Professional-grade fitness tracking with AI-powered workout generation. 
                Track your progress, achieve your goals, and transform your body with confidence.
              </motion.p>
        
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <Link
                  to="/signup"
                  className="px-6 sm:px-8 py-3 sm:py-4 gradient-primary text-primary-foreground font-semibold rounded-lg shadow-glow hover:shadow-glow hover:scale-105 transition-all duration-300 text-center relative overflow-hidden group text-sm sm:text-base"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Start Your Journey
                    <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/about"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-card text-card-foreground font-semibold rounded-lg shadow-md hover:shadow-lg border border-border hover:bg-accent hover:text-accent-foreground transition-all duration-300 text-center flex items-center justify-center text-sm sm:text-base"
                >
                  Learn More
                  <svg className="h-4 w-4 sm:h-5 sm:w-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="relative flex justify-center w-full"
            >
              <AnimatedPhone />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Program showcase section with professional design
const ProgramShowcase = () => (
  <section className="py-12 sm:py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8 sm:mb-12 md:mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6"
        >
          <span className="text-foreground">Muscle Library</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4"
        >
          Explore our comprehensive muscle library with detailed anatomical guides, exercise instructions, and proper form techniques for every muscle group.
        </motion.p>
      </div>
      
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          {featuredPrograms.map(program => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

// App Store download component
const AppStoreComponent = () => {
  return (
    <div className="bg-card p-6 rounded-xl shadow-lg relative w-fit mx-auto">
      <div className="text-center">
        <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={logo} 
            alt="FitExplorer Logo" 
            className="w-full h-full object-contain"
            style={{ 
              imageRendering: 'crisp-edges',
              transform: 'scale(1)',
              backfaceVisibility: 'hidden'
            }}
          />
        </div>
        <h3 className="text-xl font-bold text-card-foreground mb-2">FitExplorer</h3>
        <p className="text-muted-foreground text-sm mb-4">Coming Soon to App Store</p>
        
        {/* App Store Badge Placeholder */}
        <div className="bg-muted rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.96-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.03-3.11z"/>
            </svg>
            <span className="text-sm font-medium">Download on the App Store</span>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Available for iOS 13.0+
        </div>
      </div>
    </div>
  );
};

// Mobile app section with App Store info
const MobileAppSection = () => {
  return (
    <section className="py-16 relative overflow-hidden gradient-feature">
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block mb-4 px-4 py-1.5 bg-primary/10 rounded-full backdrop-blur-sm border border-primary/20 text-sm font-medium text-primary">
                Mobile App
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">Native iOS App Coming Soon</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Experience FitExplorer with native iOS performance, offline capabilities, and seamless integration with your iPhone.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 mt-1 font-semibold">1</div>
                  <div>
                    <h3 className="text-foreground font-medium mb-1">Native Performance</h3>
                    <p className="text-muted-foreground">Optimized for iOS with smooth animations and fast loading</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 mt-1 font-semibold">2</div>
                  <div>
                    <h3 className="text-foreground font-medium mb-1">Offline Access</h3>
                    <p className="text-muted-foreground">Work out anywhere with offline workout tracking</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-4 mt-1 font-semibold">3</div>
                  <div>
                    <h3 className="text-foreground font-medium mb-1">App Store Quality</h3>
                    <p className="text-muted-foreground">Professional-grade app with regular updates and support</p>
                  </div>
                </div>
              </div>
              
              {/* Current access methods */}
              <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="text-primary font-medium mb-2">Available Now:</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• <strong>Web Browser:</strong> Visit fitexplorer.se in Safari or Chrome</p>
                  <p>• <strong>Desktop:</strong> Full-featured web app on your computer</p>
                  <p>• <strong>Mobile Web:</strong> Optimized for mobile browsers</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <AppStoreComponent />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Professional journey section
const JourneySection = () => (
  <section className="py-12 sm:py-16 md:py-24 bg-background text-foreground relative overflow-hidden">
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/20 rounded-full text-xs sm:text-sm font-medium text-primary mb-4 sm:mb-6 border border-primary/30"
          >
            MY STORY
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8"
          >
            From Passion to Purpose
          </motion.h2>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-12 border border-border shadow-2xl relative"
        >
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 leading-relaxed text-card-foreground">
            FitExplorer started as a personal hobby project born from my genuine love for fitness and the frustration I felt with existing fitness apps. As someone who incorporates fitness into my daily life, I noticed that every app I tried was missing something essential that perfect balance of simplicity and functionality.
          </p>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 leading-relaxed text-card-foreground">
            When I had the opportunity to create a fitness app, I combined my passion for fitness with the knowledge I gained from school to bring this vision to life. I wanted to build the simplest solution that addressed the gaps I experienced in every other fitness app I had used.
          </p>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-card-foreground">
            I'm incredibly proud of what FitExplorer has become, and I'm committed to continuously developing and improving it to make it even better. This isn't just an app it's a reflection of my dedication to fitness and my desire to create something truly useful for fellow fitness enthusiasts.
          </p>
          
          <div className="mt-6 sm:mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg sm:text-xl md:text-2xl mb-4 sm:mb-0 sm:mr-6 md:mr-8 shadow-xl overflow-hidden border-2 sm:border-4 border-card">
              <img 
                src={profilePicture} 
                alt="Chia Ranchber" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <div className="font-bold text-base sm:text-lg md:text-xl text-card-foreground">Chia Ranchber</div>
              <div className="text-sm sm:text-base text-muted-foreground">Developer and Creator</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// Professional call to action section
const CallToAction = () => (
  <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden bg-card">
    
    <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-6 sm:mb-8 text-card-foreground">
            Ready to Transform Your Fitness?
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 md:mb-12 leading-relaxed max-w-3xl mx-auto">
            Join thousands of fitness enthusiasts who are already achieving their goals with our professional-grade platform. Start your transformation today.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-10 md:mb-12">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{stat.icon}</div>
                <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-card-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-xs sm:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link
              to="/signup"
              className="inline-flex items-center gradient-primary text-primary-foreground px-8 sm:px-10 md:px-12 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all duration-300 shadow-glow hover:shadow-glow hover:scale-105"
            >
              Get Started Free
              <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const { theme, toggleTheme } = useTheme() || { theme: 'dark', toggleTheme: () => {} };
  
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
    <div className="min-h-screen">
      {/* New Modern Navigation */}
      <Header />
      
      <main>
        {/* New Modern Hero Section */}
        <HeroSection />
        
        {/* New Modern Features Section */}
        <FeaturesSection />
        
        {/* Keep existing sections for additional content */}
        <ProgramShowcase />
        <JourneySection />
        <MobileAppSection />
      </main>
      
      {/* New Modern Footer */}
      <Footer />
      
      {/* Theme Toggle Button for Testing */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default LandingPage; 