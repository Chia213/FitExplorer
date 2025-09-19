import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { 
  Brain, 
  BarChart3, 
  Calendar, 
  Dumbbell, 
  History, 
  User,
  ArrowRight,
  Sparkles,
  Zap,
  Stars,
  Cpu
} from "lucide-react";
import LazyImage from "./LazyImage";
import aiWorkoutImage from "../assets/ai-workout-feature.jpg";
import muscleLibraryImage from "../assets/muscle-library-feature.jpg";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Workout Generator",
      description: "Revolutionary AI creates personalized workouts based on your fitness level, goals, and available equipment. Smart algorithms analyze your progress and adapt your training plan in real-time.",
      image: aiWorkoutImage,
      color: "text-primary",
      bgColor: "bg-primary/10",
      featured: true,
      badge: "AI-Powered",
      link: "/ai-workout-generator",
      padding: "p-10"
    },
    {
      icon: Dumbbell,
      title: "Workout Generator",
      description: "Create custom workouts tailored to your preferences and fitness level. Build effective training programs with our comprehensive exercise database.",
      color: "text-accent",
      bgColor: "bg-accent/10",
      link: "/workout-generator",
      padding: "p-8"
    },
    {
      icon: Calendar,
      title: "Workout Log",
      description: "Track every rep, set, and weight with our intuitive logging system. Never lose track of your progress again.",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/workout-log",
      padding: "p-8"
    },
    {
      icon: History,
      title: "Workout History", 
      description: "Review your complete training history with detailed analytics. See how far you've come and plan where you're going.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      link: "/workout-history",
      padding: "p-8"
    },
    {
      icon: Calendar,
      title: "Workout Routines",
      description: "Create and customize workout routines that fit your schedule. From beginner to advanced, build your perfect training program.",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/routines",
      padding: "p-8"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Visualize your gains with comprehensive charts and analytics. Track strength, endurance, and body composition changes over time.",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      link: "/progress-tracker",
      padding: "p-8"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.03),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-6 py-3 rounded-full text-sm font-semibold border border-primary/20 backdrop-blur-sm shadow-sm">
            <Sparkles className="w-4 h-4" />
            Core Features
          </div>
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-clip-text bg-[length:200%_100%] animate-gradient">
              Achieve Your Goals
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Powered by advanced technology and designed for real results. 
            Our comprehensive platform adapts to your unique fitness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isFeatured = feature.featured;
            
            return (
              <Card 
                key={feature.title}
                className={`relative overflow-hidden transition-all duration-700 hover:scale-[1.02] group ${
                  isFeatured 
                    ? "bg-gradient-to-br from-primary/5 via-background to-accent/5 border-2 border-primary/30 hover:border-primary/50 shadow-2xl hover:shadow-3xl backdrop-blur-sm min-h-[500px]" 
                    : "bg-card/80 backdrop-blur-sm border border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 min-h-[450px]"
                }`}
              >
                {/* Special animated border for featured items */}
                {isFeatured && (
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10" />
                )}
                
                {/* Featured badge */}
                {isFeatured && feature.badge && (
                  <div className="absolute top-6 right-6 z-10">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg border border-white/20">
                      <Stars className="w-3 h-3" />
                      {feature.badge}
                    </div>
                  </div>
                )}
                
                <CardContent className={`${feature.padding} space-y-6 relative flex flex-col h-full`}>
                  {feature.image && (
                    <div className={`relative rounded-2xl overflow-hidden mb-6 ${
                      isFeatured ? "aspect-video" : "aspect-video"
                    } shadow-lg`}>
                      {/* Enhanced frame for featured items */}
                      {isFeatured && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10 z-10 pointer-events-none" />
                      )}
                      <LazyImage 
                        src={feature.image} 
                        alt={feature.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        placeholder="Loading..."
                      />
                      {/* Animated corner accents for featured */}
                      {isFeatured && (
                        <>
                          <div className="absolute top-3 left-3 w-8 h-8 border-l-2 border-t-2 border-primary/70 transition-all duration-500 group-hover:border-primary group-hover:w-10 group-hover:h-10 rounded-tl-lg" />
                          <div className="absolute bottom-3 right-3 w-8 h-8 border-r-2 border-b-2 border-accent/70 transition-all duration-500 group-hover:border-accent group-hover:w-10 group-hover:h-10 rounded-br-lg" />
                        </>
                      )}
                    </div>
                  )}
                  
                  <div className={`relative ${
                    isFeatured 
                      ? "w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 shadow-lg" 
                      : `w-14 h-14 ${feature.bgColor} border border-border/40 shadow-md`
                    } rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                    <Icon className={`${isFeatured ? "w-8 h-8" : "w-7 h-7"} ${feature.color} ${
                      isFeatured ? "group-hover:rotate-12" : "group-hover:rotate-6"
                    } transition-transform duration-500`} />
                    {isFeatured && (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                    )}
                  </div>
                  
                  <div className="space-y-4 flex-grow">
                    <h3 className={`font-bold ${isFeatured ? "text-3xl" : "text-2xl"} tracking-tight ${
                      isFeatured ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" : "text-foreground"
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-muted-foreground leading-relaxed ${
                      isFeatured ? "text-lg" : "text-base"
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto">
                    <Link to={feature.link}>
                      <Button 
                        variant={isFeatured ? "default" : "outline"} 
                        size="lg" 
                        className={`group/button touch-manipulation font-semibold w-full ${
                          isFeatured 
                            ? "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl hover:shadow-2xl border-0" 
                            : "border-2 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300"
                        }`}
                      >
                        {isFeatured ? "Try AI Generator" : "Learn More"}
                        <ArrowRight className="w-5 h-5 ml-2 group-hover/button:translate-x-1 transition-transform duration-300" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-20">
          <div className="inline-flex flex-col items-center space-y-4">
            <Link to="/signup">
              <Button 
                variant="default" 
                size="xl" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-12 py-6 text-lg font-bold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-500 border-0"
              >
                <Zap className="w-6 h-6 mr-3" />
                Start Your Fitness Journey
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Join thousands of users who are already achieving their fitness goals
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;