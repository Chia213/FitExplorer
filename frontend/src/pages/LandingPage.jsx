import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import titanImage from '../assets/titan.png';
import femaleTitanImage from '../assets/female-titan.png';
import '../styles/landing-page.css';

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

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      id: 1,
      title: "AI Workout Generator",
      description: "Get personalized AI workouts based on your goals, equipment, and experience level that adapt as you progress.",
      icon: "🏋️‍♀️",
      link: "/ai-workout-generator",
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Nutrition Tracking",
      description: "Track meals, calories, and macros with our smart nutrition system that provides personalized recommendations.",
      icon: "🥗",
      link: "/nutrition",
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Progress Tracking",
      description: "Visualize your fitness journey with detailed progress graphs, body measurements, and performance metrics.",
      icon: "📈",
      link: "/progress-tracker",
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Exercise Library",
      description: "Access 500+ exercises with step-by-step instructions, video demonstrations, and proper form guidance.",
      icon: "📚",
      link: "/routines",
      color: "bg-amber-500"
    },
    {
      id: 5,
      title: "Personal Records",
      description: "Track and celebrate your personal bests with automatic PR detection and achievement unlocks.",
      icon: "🏆",
      link: "/personal-records",
      color: "bg-red-500"
    },
    {
      id: 6,
      title: "Fitness Calculators",
      description: "Optimize your fitness journey with BMI, TDEE, body fat, and other essential calculators in one place.",
      icon: "🧮",
      link: "/fitness-calculator",
      color: "bg-teal-500"
    }
  ];

  const testimonials = [
    {
      id: 1,
      quote: "The AI workout generator is incredible! It adapts to my progress and keeps challenging me with new routines. I've seen more progress in 3 months than I did in a whole year before.",
      name: "Sarah K.",
      title: "Fitness Enthusiast",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 2,
      quote: "The nutrition tracking paired with workout planning has completely transformed my approach to fitness. I've lost 25lbs and gained significant muscle definition.",
      name: "Michael T.",
      title: "Weight Loss Journey",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 3,
      quote: "As a busy professional, I love how this app streamlines everything. The progress tracking keeps me motivated and the workout variety prevents plateaus.",
      name: "Emma R.",
      title: "Working Professional",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg"
    }
  ];

  const stats = [
    { value: "500+", label: "Exercises" },
    { value: "50,000+", label: "Active Users" },
    { value: "98%", label: "Satisfaction Rate" },
    { value: "10M+", label: "Workouts Completed" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className="relative py-20 bg-gradient-to-b from-blue-900 via-indigo-800 to-purple-900 text-white overflow-hidden"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-pattern opacity-10"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-20 pulse-animation"></div>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl opacity-20 pulse-animation" style={{ animationDelay: '2s' }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text"
                variants={fadeIn}
                transition={{ delay: 0.2 }}
              >
                Your Complete Fitness Journey
              </motion.h1>
              <motion.p 
                className="text-xl mb-8 text-blue-100"
                variants={fadeIn}
                transition={{ delay: 0.4 }}
              >
                Personalized AI workouts, nutrition tracking, and progress monitoring — all in one powerful platform designed to transform your fitness experience.
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row justify-center md:justify-start gap-4"
                variants={fadeIn}
                transition={{ delay: 0.6 }}
              >
                <Link to="/signup" className="btn-gradient text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 hover:-translate-y-1">
                  Start Your Journey
                </Link>
                <Link to="/login" className="glass-effect text-white font-semibold py-3 px-8 rounded-lg shadow-lg transform transition hover:scale-105 hover:-translate-y-1">
                  Sign In
                </Link>
              </motion.div>
            </div>
            <motion.div 
              className="md:w-1/2 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative h-80 sm:h-96 overflow-hidden">
                <img 
                  src={titanImage} 
                  alt="Male Fitness" 
                  className="absolute w-72 h-auto object-contain object-center right-0 top-0 float-animation"
                  style={{ animationDelay: '0.5s' }}
                />
                <img 
                  src={femaleTitanImage} 
                  alt="Female Fitness" 
                  className="absolute w-64 h-auto object-contain object-center left-10 bottom-0 float-animation"
                />
              </div>
            </motion.div>
          </div>
          
          {/* Stats Bar */}
          <motion.div 
            className="mt-16 py-6 px-6 glass-effect rounded-2xl shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm md:text-base text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-sm">Features</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-2">Everything You Need For Success</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Our all-in-one platform provides the tools and guidance you need to achieve your fitness goals.</p>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl feature-card group"
                variants={cardVariants}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="p-8">
                  <div className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center text-white text-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    <span>{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{feature.description}</p>
                  <Link to={feature.link} className="text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center group">
                    <span>Explore</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <motion.section 
        className="py-20 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-indigo-950"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-sm">How It Works</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-2">Simple Steps to Fitness Success</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Getting started is quick and easy - you're just a few clicks away from your personalized fitness experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">1</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-300">Set up your profile with your fitness goals, experience level, available equipment, and preferences.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">2</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Get Personalized Plans</h3>
              <p className="text-gray-600 dark:text-gray-300">Receive AI-generated workout routines and nutrition recommendations tailored specifically to you.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg relative"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">3</div>
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Track & Improve</h3>
              <p className="text-gray-600 dark:text-gray-300">Log your workouts, monitor progress, and watch as the AI adapts your plans based on your results.</p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase text-sm">Testimonials</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-2">Success Stories From Our Community</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Join thousands of satisfied users who have transformed their fitness journey with our app.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 testimonial-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="flex items-center mb-6">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name} 
                    className="w-14 h-14 rounded-full mr-4 border-2 border-blue-500"
                  />
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.title}</p>
                  </div>
                </div>
                <div className="mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Fitness Journey?</h2>
            <p className="text-xl mb-8 text-blue-100">Join today and get full access to all premium features to help you reach your fitness goals faster.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="bg-white text-indigo-700 font-bold py-4 px-10 rounded-lg shadow-xl transform transition hover:scale-105 hover:-translate-y-1">
                Start Free Trial
              </Link>
              <Link to="/about" className="glass-effect border-2 border-white text-white font-semibold py-4 px-10 rounded-lg shadow-lg transform transition hover:scale-105 hover:-translate-y-1">
                Learn More
              </Link>
            </div>
            <p className="text-blue-200 mt-6 text-sm">No credit card required. Free 14-day trial.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 