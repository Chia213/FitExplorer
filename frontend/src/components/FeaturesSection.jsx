import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: "AI Workout Generator",
    description: "Get personalized workout plans powered by advanced AI that adapts to your progress and goals.",
    icon: "🤖",
    color: "from-blue-500 to-indigo-500"
  },
  {
    title: "Smart Progress Tracking",
    description: "Track your fitness journey with detailed analytics, charts, and performance metrics.",
    icon: "📈",
    color: "from-green-500 to-emerald-500"
  },
  {
    title: "Nutrition Planning",
    description: "Receive customized meal plans and track your nutrition with our intelligent food database.",
    icon: "🥗",
    color: "from-orange-500 to-amber-500"
  },
  {
    title: "Exercise Library",
    description: "Access our comprehensive library of exercises with detailed instructions and form guides.",
    icon: "💪",
    color: "from-purple-500 to-pink-500"
  },
  {
    title: "Community Support",
    description: "Connect with like-minded fitness enthusiasts and share your progress with the community.",
    icon: "👥",
    color: "from-red-500 to-rose-500"
  },
  {
    title: "Mobile Optimization",
    description: "Access your workouts and track progress on any device with our responsive design.",
    icon: "📱",
    color: "from-cyan-500 to-teal-500"
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
      <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
           style={{ backgroundImage: `linear-gradient(to right, var(--${feature.color}))` }}
      ></div>
      
      <div className="relative glass-effect rounded-2xl p-6 h-full transform group-hover:-translate-y-2 transition-transform duration-300">
        <div className="text-4xl mb-4">{feature.icon}</div>
        <h3 className="text-xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, var(--${feature.color}))` }}>
          {feature.title}
        </h3>
        <p className="text-neutral-400 group-hover:text-neutral-300 transition-colors duration-300">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-neutral-900">
      <div className="container-modern">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Powerful Features for Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
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
            Everything you need to achieve your fitness goals, powered by cutting-edge technology
            and designed for the best possible user experience.
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