import { useState, useEffect } from "react";
import { Dumbbell, TrendingUp, Calendar, Zap, Target, BarChart3, Brain, History, BookOpen, Users, Layers, Settings } from "lucide-react";
import LazyImage from "./LazyImage";
import aiWorkoutScreenshot from "../assets/ai-workout-generator-screenshot.png";

const PhoneShowcase = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const phoneScreens = [
    {
      title: "Workout Log",
      subtitle: "Track every rep",
      icon: Dumbbell,
      content: (
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">Today's Workout</span>
            <span className="text-xs text-primary">45 min</span>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between p-2 sm:p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Bench Press</p>
                  <p className="text-xs text-muted-foreground">3 sets completed</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-primary">85kg</span>
            </div>
            
            <div className="flex items-center justify-between p-2 sm:p-3 bg-accent/10 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Squats</p>
                  <p className="text-xs text-muted-foreground">4 sets completed</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-bold text-accent">95kg</span>
            </div>
            
            <div className="flex items-center justify-between p-2 sm:p-3 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs sm:text-sm font-medium">Deadlifts</p>
                  <p className="text-xs text-muted-foreground">Next exercise</p>
                </div>
              </div>
              <span className="text-xs sm:text-sm text-muted-foreground">120kg</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "AI Workout Generator",
      subtitle: "Smart routines", 
      icon: Brain,
      content: (
        <div className="w-full h-full -mx-4 -mt-4 overflow-hidden rounded-t-[2rem] bg-background">
          <LazyImage 
            src={aiWorkoutScreenshot}
            alt="AI Workout Generator Interface"
            className="w-full h-full object-cover"
            style={{ 
              width: '248px',
              height: '420px',
              objectFit: 'cover',
              objectPosition: 'center 20%'
            }}
            placeholder="Loading AI Workout..."
          />
        </div>
      )
    },
    {
      title: "Progress Tracking",
      subtitle: "Track your gains",
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-primary">+12%</p>
              <p className="text-xs text-muted-foreground">Strength</p>
            </div>
            <div className="text-center p-3 bg-accent/10 rounded-lg">
              <Calendar className="w-4 h-4 text-accent mx-auto mb-1" />
              <p className="text-lg font-bold text-accent">28</p>
              <p className="text-xs text-muted-foreground">Days streak</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>This Month</span>
              <span className="font-medium">16 workouts</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="gradient-accent h-2 rounded-full" style={{ width: "85%" }}></div>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mt-4">
            {Array.from({ length: 7 }, (_, i) => (
              <div 
                key={i} 
                className={`h-6 rounded ${i < 5 ? 'gradient-primary' : 'bg-muted'}`}
              ></div>
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">Weekly activity</p>
        </div>
      )
    },
    {
      title: "Workout Routines",
      subtitle: "Ready-to-use programs",
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium">5/3/1 Beginner</p>
                  <p className="text-xs text-muted-foreground">12 weeks • Strength</p>
                </div>
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Popular</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Progressive overload program</p>
              <div className="flex gap-2">
                <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded">4 days/week</span>
              </div>
            </div>
            
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium">Push Pull Legs</p>
                  <p className="text-xs text-muted-foreground">6 weeks • Hypertrophy</p>
                </div>
                <span className="text-xs text-muted-foreground">Free</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Classic muscle building split</p>
              <div className="flex gap-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">6 days/week</span>
              </div>
            </div>
          </div>
          
          <div className="text-center p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <BookOpen className="w-5 h-5 mx-auto mb-2 text-primary" />
            <p className="text-sm font-medium">50+ routines</p>
            <p className="text-xs text-muted-foreground">All fitness levels</p>
          </div>
        </div>
      )
    },
    {
      title: "My History",
      subtitle: "Personal records",
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <p className="text-lg font-bold text-primary">247</p>
              <p className="text-xs text-muted-foreground">Total workouts</p>
            </div>
            <div className="text-center p-3 bg-accent/10 rounded-lg">
              <p className="text-lg font-bold text-accent">8.2kg</p>
              <p className="text-xs text-muted-foreground">Muscle gained</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Personal Records</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-card rounded">
                <span className="text-sm">Bench Press</span>
                <span className="text-sm font-bold text-primary">120kg</span>
              </div>
              <div className="flex justify-between p-2 bg-card rounded">
                <span className="text-sm">Squat</span>
                <span className="text-sm font-bold text-accent">140kg</span>
              </div>
              <div className="flex justify-between p-2 bg-card rounded">
                <span className="text-sm">Deadlift</span>
                <span className="text-sm font-bold text-primary">180kg</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Muscle Guide",
      subtitle: "Learn anatomy",
      icon: Layers,
      content: (
        <div className="space-y-2 sm:space-y-3">
          <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-primary" />
            <p className="text-xs sm:text-sm font-medium">Interactive 3D Model</p>
            <p className="text-xs text-muted-foreground">Tap muscles to learn</p>
          </div>
          
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-card rounded-lg">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">C</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Chest</p>
                <p className="text-xs text-muted-foreground">Pectorals major & minor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-card rounded-lg">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-accent/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-accent">B</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Back</p>
                <p className="text-xs text-muted-foreground">Latissimus dorsi, rhomboids</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-card rounded-lg">
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary">L</span>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium">Legs</p>
                <p className="text-xs text-muted-foreground">Quadriceps, hamstrings</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Custom Exercises",
      subtitle: "Create your own",
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Exercise Builder</span>
            </div>
            <p className="text-xs text-muted-foreground">Create custom movements</p>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium">Cable Fly Variation</p>
                  <p className="text-xs text-muted-foreground">Custom • Chest</p>
                </div>
                <span className="text-xs text-primary">My exercise</span>
              </div>
            </div>
            
            <div className="p-3 bg-card border border-border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium">Bulgarian Split Squat+</p>
                  <p className="text-xs text-muted-foreground">Custom • Legs</p>
                </div>
                <span className="text-xs text-accent">Modified</span>
              </div>
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/20 rounded-lg">
            <p className="text-sm font-medium">12 custom exercises</p>
            <p className="text-xs text-muted-foreground">Created by you</p>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phoneScreens.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [phoneScreens.length]);

  const Phone = ({ screen, isActive = false, scale = 1 }) => (
    <div className={`relative transition-all duration-700 ${isActive ? 'z-10' : 'z-0'}`} 
         style={{ transform: `scale(${scale})` }}>
      {/* Phone Shadow */}
      <div className={`absolute inset-0 gradient-primary rounded-[2rem] sm:rounded-[2.25rem] md:rounded-[2.5rem] blur-xl opacity-20 ${isActive ? 'animate-pulse scale-110' : 'scale-100'} transition-all duration-500`}></div>
      
      {/* Phone Body */}
      <div className="relative bg-gray-900 rounded-[2rem] sm:rounded-[2.25rem] md:rounded-[2.5rem] p-1 sm:p-1.5 shadow-2xl border-2 border-gray-800">
        {/* Screen */}
        <div className="bg-background rounded-[1.5rem] sm:rounded-[1.75rem] md:rounded-[2rem] p-2 sm:p-3 md:p-4 h-[350px] sm:h-[400px] md:h-[500px] w-[180px] sm:w-[200px] md:w-[240px] relative overflow-hidden">
          {/* Status Bar */}
          <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
            <span className="font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                <div className="w-1 h-1 bg-muted rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* App Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">FE</span>
              </div>
              <div>
                <h2 className="font-bold text-sm leading-tight">{screen.title}</h2>
                <p className="text-xs text-muted-foreground">{screen.subtitle}</p>
              </div>
            </div>
            <screen.icon className="w-4 h-4 text-muted-foreground" />
          </div>
          
          {/* Screen Content */}
          <div className="overflow-hidden">
            {screen.content}
          </div>
        </div>
        
        {/* Home Indicator */}
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Mobile View - 3 Phone Carousel */}
      <div className="lg:hidden">
        <div className="flex items-center justify-center gap-2 relative h-[400px] overflow-hidden">
          {[
            phoneScreens[(currentIndex - 1 + phoneScreens.length) % phoneScreens.length], // Previous
            phoneScreens[currentIndex], // Current
            phoneScreens[(currentIndex + 1) % phoneScreens.length] // Next
          ].map((screen, index) => {
            const isCenter = index === 1;
            const isLeft = index === 0;
            const isRight = index === 2;
            
            let scale = 0.6;
            let translateX = 0;
            let opacity = 0.6;
            let zIndex = 0;
            
            if (isCenter) {
              scale = 0.8;
              opacity = 1;
              zIndex = 10;
            } else if (isLeft) {
              scale = 0.6;
              translateX = -80;
              opacity = 0.6;
              zIndex = 5;
            } else if (isRight) {
              scale = 0.6;
              translateX = 80;
              opacity = 0.6;
              zIndex = 5;
            }
            
            return (
              <div
                key={`${currentIndex}-${index}`}
                className={`absolute transition-all duration-700 ease-in-out group ${
                  isLeft || isRight ? 'cursor-pointer hover:scale-105' : 'cursor-default'
                }`}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex
                }}
                onClick={() => {
                  if (isLeft) setCurrentIndex((prev) => (prev - 1 + phoneScreens.length) % phoneScreens.length);
                  if (isRight) setCurrentIndex((prev) => (prev + 1) % phoneScreens.length);
                }}
              >
                <Phone screen={screen} isActive={isCenter} scale={1} />
                {/* Click indicator for side phones */}
                {(isLeft || isRight) && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {isLeft ? '← Previous' : 'Next →'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop View - Carousel of Phones */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-center gap-4 xl:gap-8 relative h-[600px]">
          {phoneScreens.map((screen, index) => {
            const isCenter = index === currentIndex;
            const isLeft = index === (currentIndex - 1 + phoneScreens.length) % phoneScreens.length;
            const isRight = index === (currentIndex + 1) % phoneScreens.length;
            
            let scale = 0.7;
            let translateX = 0;
            let opacity = 0;
            let zIndex = 0;
            
            if (isCenter) {
              scale = 1;
              opacity = 1;
              zIndex = 10;
            } else if (isLeft) {
              scale = 0.85;
              translateX = -180;
              opacity = 0.7;
              zIndex = 5;
            } else if (isRight) {
              scale = 0.85;
              translateX = 180;
              opacity = 0.7;
              zIndex = 5;
            }
            
            return (
              <div
                key={index}
                className="absolute transition-all duration-700 ease-in-out"
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex
                }}
              >
                <Phone screen={screen} isActive={isCenter} scale={1} />
              </div>
            );
          })}
        </div>
      </div>
      
       {/* Carousel Indicators */}
       <div className="flex justify-center gap-1 mt-2 sm:mt-4">
         {phoneScreens.map((_, index) => (
           <div
             key={index}
             onClick={() => setCurrentIndex(index)}
             className={`rounded-full transition-all duration-300 cursor-pointer ${
               index === currentIndex 
                 ? 'gradient-primary shadow-glow' 
                 : 'bg-muted hover:bg-muted-foreground/50 active:scale-95'
             }`}
             style={{
               width: '6px',
               height: '6px',
               minWidth: '6px',
               minHeight: '6px',
               maxWidth: '6px',
               maxHeight: '6px',
               padding: '0',
               margin: '0',
               border: 'none',
               outline: 'none',
               borderRadius: '50%',
               flexShrink: '0'
             }}
           />
         ))}
       </div>
    </div>
  );
};

export default PhoneShowcase;
