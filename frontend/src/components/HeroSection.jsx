import { Button } from "./ui/button";
import { PlayCircle, Zap, Target, TrendingUp } from "lucide-react";
import LazyImage from "./LazyImage";
import heroImage from "../assets/fitness-hero.jpg";
import PhoneShowcase from "./AnimatedPhone";

const HeroSection = () => {
  return (
    <section className="gradient-hero min-h-screen flex items-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-background/95 z-10"></div>
        
        {/* Hero background image */}
        <LazyImage
          src={heroImage}
          alt="Fitness background"
          className="absolute inset-0 w-full h-full opacity-15"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
        
        {/* Animated floating elements */}
        <div className="absolute inset-0 z-5">
          {/* Large floating orbs */}
          <div className="absolute top-20 left-10 w-32 h-32 gradient-primary rounded-full opacity-20 animate-pulse blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 gradient-accent rounded-full opacity-30 animate-pulse blur-lg" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-32 left-20 w-20 h-20 gradient-primary rounded-full opacity-25 animate-pulse blur-md" style={{ animationDelay: '2s' }}></div>
          
          {/* Moving gradient waves */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-0 w-96 h-96 gradient-primary rounded-full opacity-10 blur-3xl animate-float"></div>
            <div className="absolute bottom-1/4 right-0 w-80 h-80 gradient-accent rounded-full opacity-15 blur-2xl animate-float-delayed"></div>
          </div>
          
          {/* Subtle geometric shapes */}
          <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary rounded-full opacity-60 animate-twinkle"></div>
          <div className="absolute top-1/2 left-1/3 w-2 h-2 bg-accent rounded-full opacity-50 animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-primary rounded-full opacity-70 animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-accent rounded-full opacity-40 animate-twinkle" style={{ animationDelay: '2.5s' }}></div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Your Fitness
                <span className="block">
                  Journey{" "}
                  <span className="text-transparent bg-gradient-to-r from-primary to-accent bg-clip-text">
                    Starts Here
                  </span>
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Every rep counts. Every set matters. Log your workouts, follow proven routines, 
                track your progress, and build the stronger version of yourself you've always wanted.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" className="group touch-manipulation">
                <Zap className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                Start Your Journey
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">AI-Powered Workouts</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Progress Tracking</span>
              </div>
            </div>
          </div>

          {/* iPhone Carousel Showcase */}
          <div className="relative flex justify-center">
            {/* Enhanced background for iPhone showcase */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Main glow effect behind phones */}
              <div className="w-96 h-96 gradient-primary rounded-full opacity-20 blur-3xl animate-pulse"></div>
              
              {/* Secondary accent glow */}
              <div className="absolute w-80 h-80 gradient-accent rounded-full opacity-15 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Subtle ring effect */}
              <div className="absolute w-[500px] h-[500px] rounded-full border border-primary/10 animate-pulse"></div>
              <div className="absolute w-[600px] h-[600px] rounded-full border border-accent/5 animate-pulse" style={{ animationDelay: '2s' }}></div>
              
              {/* Dynamic light rays */}
              <div className="absolute w-full h-full">
                <div className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-transparent via-primary/30 to-transparent rotate-12 animate-pulse blur-sm"></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-transparent via-accent/20 to-transparent -rotate-12 animate-pulse blur-sm" style={{ animationDelay: '1.5s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-32 bg-gradient-to-t from-transparent via-primary/20 to-transparent rotate-45 animate-pulse blur-sm" style={{ animationDelay: '3s' }}></div>
              </div>
            </div>
            
            <PhoneShowcase />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;