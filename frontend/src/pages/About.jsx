import { Link, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Zap, BarChart3, Target, Shield, Clock, Brain, TrendingUp } from "lucide-react";

const About = () => {
  const navigate = useNavigate();
  
  const stats = [
    { number: "500+", label: "Exercises", icon: Zap },
    { number: "AI", label: "Powered", icon: Brain },
    { number: "100%", label: "Free", icon: CheckCircle },
    { number: "24/7", label: "Available", icon: Clock },
  ];
  
  const features = [
    {
      title: "AI Workout Generator",
      description: "Get personalized AI workouts based on your goals, equipment, and experience level that adapt as you progress.",
      icon: Brain,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Workout Logging",
      description: "Track your training with our comprehensive workout system. Log exercises, sets, reps, and weights to build a complete fitness history.",
      icon: BarChart3,
      gradient: "from-green-500 to-blue-600"
    },
    {
      title: "Progress Tracking",
      description: "Visualize your fitness journey with comprehensive charts that monitor strength gains, body measurements, and performance metrics.",
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Customizable Routines",
      description: "Create and save your favorite workout routines. Organize exercises into effective programs for consistent training.",
      icon: Target,
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Exercise Library",
      description: "Access 500+ exercises with detailed instructions and visual demonstrations for proper form and technique guidance.",
      icon: Zap,
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      title: "Secure & Private",
      description: "Your fitness data is protected with enterprise-grade security. We respect your privacy and never share your personal information.",
      icon: Shield,
      gradient: "from-green-500 to-teal-600"
    }
  ];

  const values = [
    { label: "AI-Powered", color: "bg-primary" },
    { label: "Data-Driven", color: "bg-accent" },
    { label: "Personalized", color: "bg-secondary" },
    { label: "Secure", color: "bg-muted" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="space-y-6 animate-fade-in-up">
            <Badge variant="outline" className="border-primary/50 text-primary mb-4">
              About FitExplorer
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold hero-text mb-6">
              We Are FitExplorer
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              The future of fitness is here. Experience AI-powered workout generation, 
              intelligent progress tracking, and personalized guidance that adapts to your unique journey.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {values.map((value, index) => (
                <Badge key={index} variant="secondary" className="px-4 py-2 text-sm">
                  {value.label}
                </Badge>
              ))}
              </div>
              </div>
            </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card text-center p-8 glow-effect">
                <CardContent className="p-0">
                  <stat.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <div className="text-4xl font-bold text-foreground mb-2">{stat.number}</div>
                  <div className="text-muted-foreground font-medium">{stat.label}</div>
                </CardContent>
              </Card>
                ))}
              </div>
            </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-12 animate-scale-in">
            <h2 className="text-4xl font-bold mb-6 hero-text">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              FitExplorer is a comprehensive fitness platform designed to help you achieve your health 
              and fitness goals through smart technology and personalized guidance. Our mission is to 
              make fitness accessible, effective, and enjoyable for everyone by combining AI-powered 
              workout generation, intuitive tracking tools, and data-driven insights that keep you 
              motivated on your journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90"
                onClick={() => navigate('/signup')}
                  >
                    🚀 Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/ai-workout-generator')}
                  >
                    🤖 Try AI Workouts
              </Button>
                </div>
              </div>
            </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 hero-text">Our Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover the comprehensive tools and features designed to transform your fitness journey
            </p>
            </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="feature-card group cursor-pointer">
                <CardContent className="p-0">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
              </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
      </section>



      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-muted-foreground">
            © 2025 FitExplorer. All rights reserved.
          </p>
      </div>
      </footer>
    </div>
  );
};

export default About;
