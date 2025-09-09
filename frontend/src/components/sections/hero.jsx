import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Brain, BarChart3, Target, Zap, Dumbbell, TrendingUp, Clock, Users, Star, Award, Heart } from "lucide-react";
import heroImage from "@/assets/hero-phone.jpg";
import aiWorkoutPreview from "@/assets/ai-workoutgenerator-preview.png";
import workoutLogPreview from "@/assets/workout-log-preview.png";
import exerciseLibraryPreview from "@/assets/exerciselibrarypreview.png";

export function HeroSection() {
  const [currentDemo, setCurrentDemo] = useState(0);
  
  const demoFeatures = [
    { 
      icon: BarChart3, 
      title: "Workout Log", 
      description: "Track your exercises and progress",
      color: "text-green-400",
      image: workoutLogPreview
    },
    { 
      icon: Dumbbell, 
      title: "Workout Generator", 
      description: "Generate custom workout routines",
      color: "text-orange-400",
      image: aiWorkoutPreview
    },
    { 
      icon: Target, 
      title: "Exercise Library", 
      description: "Browse exercises by muscle group",
      color: "text-purple-400",
      image: exerciseLibraryPreview
    }
  ];

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemo((prev) => (prev + 1) % demoFeatures.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [demoFeatures.length]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Your Fitness Journey{" "}
              <span className="hero-text">Starts Here</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Professional-grade fitness tracking with AI-powered workout generation. 
              Track your progress, achieve your goals, and transform your body with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow animate-glow group"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-glass-border hover:bg-card/50 group"
              >
                <PlayCircle className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>
            
            <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>AI-Powered Workouts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span>Progress Tracking</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Personal Plans</span>
              </div>
            </div>
          </div>
          
           {/* Right Content - App Preview */}
           <div className="relative animate-fade-in">
             <div className="relative max-w-md mx-auto">
               {/* Main Demo Card */}
               <div className="p-4">
                 <div className="text-center mb-4">
                   <h3 className="text-lg font-semibold mb-1">App Preview</h3>
                   <p className="text-xs text-muted-foreground">See FitExplorer in action</p>
                 </div>
                 
                 {/* iPhone Frame */}
                 <div className="relative mx-auto w-56 h-[420px] bg-black rounded-[1.5rem] p-1.5 shadow-2xl">
                   {/* iPhone Screen */}
                   <div className="w-full h-full bg-white rounded-[1.2rem] overflow-hidden relative">
                     {/* Status Bar */}
                     <div className="absolute top-0 left-0 right-0 h-4 bg-black rounded-t-[1.2rem] flex items-center justify-between px-3 text-white text-[10px]">
                       <span>9:41</span>
                       <div className="flex items-center space-x-1">
                         <div className="w-3 h-1.5 bg-white rounded-sm"></div>
                         <div className="w-4 h-2 border border-white rounded-sm">
                           <div className="w-3 h-1.5 bg-white rounded-sm m-0.5"></div>
                         </div>
                       </div>
                     </div>
                     
                     {/* App Content */}
                     <div className="pt-4 h-full">
                       <img
                         src={demoFeatures[currentDemo].image}
                         alt={demoFeatures[currentDemo].title}
                         className="w-full h-full object-contain"
                       />
                     </div>
                     
                     {/* Home Indicator */}
                     <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gray-400 rounded-full"></div>
                   </div>
                 </div>
                 
                 {/* Slides Preview */}
                 <div className="mt-4">
                   <div className="text-center mb-2">
                     <span className="text-xs text-muted-foreground">
                       {currentDemo + 1} of {demoFeatures.length} • {demoFeatures[currentDemo].title}
                     </span>
                   </div>
                   
                   {/* Slide Navigation */}
                   <div className="flex justify-center space-x-1">
                     {demoFeatures.map((_, index) => (
                       <button
                         key={index}
                         onClick={() => setCurrentDemo(index)}
                         className={`w-2 h-2 rounded-full transition-all duration-300 ${
                           currentDemo === index 
                             ? "bg-primary w-6" 
                             : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                         }`}
                       />
                     ))}
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>
      
    </section>
  );
}
