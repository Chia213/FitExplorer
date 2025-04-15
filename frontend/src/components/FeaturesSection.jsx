import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "AI Workout Generator",
    description: "Get personalized workout plans powered by advanced AI that adapts to your progress and goals.",
    icon: "🤖",
    color: "from-blue-500 to-indigo-500",
    gradient: "linear-gradient(135deg, var(--primary-400), var(--primary-600))"
  },
  {
    title: "Smart Progress Tracking",
    description: "Track your fitness journey with detailed analytics, charts, and performance metrics.",
    icon: "📈",
    color: "from-green-500 to-emerald-500",
    gradient: "linear-gradient(135deg, var(--success-500), var(--success-700))"
  },
  {
    title: "Nutrition Planning",
    description: "Receive customized meal plans and track your nutrition with our intelligent food database.",
    icon: "🥗",
    color: "from-orange-500 to-amber-500",
    gradient: "linear-gradient(135deg, var(--accent-400), var(--accent-600))"
  },
  {
    title: "Exercise Library",
    description: "Access our comprehensive library of exercises with detailed instructions and form guides.",
    icon: "💪",
    color: "from-purple-500 to-pink-500",
    gradient: "linear-gradient(135deg, #9f7aea, #ed64a6)"
  },
  {
    title: "Community Support",
    description: "Connect with like-minded fitness enthusiasts and share your progress with the community.",
    icon: "👥",
    color: "from-red-500 to-rose-500",
    gradient: "linear-gradient(135deg, #f56565, #e53e3e)"
  },
  {
    title: "Mobile Optimization",
    description: "Access your workouts and track progress on any device with our responsive design.",
    icon: "📱",
    color: "from-cyan-500 to-teal-500",
    gradient: "linear-gradient(135deg, #0d9488, #0891b2)"
  }
];

const FeatureCard = ({ feature, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="relative group"
    >
      {/* Softer glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-md"
           style={{ backgroundImage: feature.gradient }}
      ></div>
      
      <div className="relative bg-neutral-800/60 backdrop-blur-sm border border-neutral-700/50 rounded-2xl p-6 h-full transform group-hover:-translate-y-2 transition-all duration-300 group-hover:border-opacity-50 group-hover:shadow-lg"
           style={{ 
             boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.05) inset", 
             borderImage: `${feature.gradient} 1` 
           }}
      >
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 text-2xl"
               style={{ background: feature.gradient }}>
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold" style={{ background: feature.gradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {feature.title}
          </h3>
        </div>
        <p className="text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300 ml-16">
          {feature.description}
        </p>
        
        {/* Subtle indicator for interaction */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-xs font-medium px-2 py-1 rounded-full" 
                style={{ background: feature.gradient }}>
            Explore
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-neutral-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/src/assets/grid-pattern.svg')] opacity-5"></div>
      <div className="absolute -left-64 top-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute -right-64 bottom-1/4 w-96 h-96 bg-accent-500/10 rounded-full filter blur-3xl"></div>

      <div className="container-modern relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-2 px-4 py-1.5 bg-primary-900/50 rounded-full backdrop-blur-sm border border-primary-700/30"
          >
            <span className="text-sm font-medium text-primary-400">Premium Features</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Everything You Need for Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mt-1">
              Fitness Journey
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-neutral-400 max-w-2xl mx-auto"
          >
            Cutting-edge technology combined with thoughtful design to help you achieve 
            your fitness goals faster and more effectively.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection; 