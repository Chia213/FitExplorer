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
  Cpu,
  Target,
  TrendingUp
} from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Workout Generator",
      description: "Personalized workouts powered by AI",
      color: "text-primary",
      bgColor: "bg-primary/10",
      link: "/ai-workout-generator"
    },
    {
      icon: Dumbbell,
      title: "Workout Generator",
      description: "Create custom training programs",
      color: "text-accent",
      bgColor: "bg-accent/10",
      link: "/workout-generator"
    },
    {
      icon: Calendar,
      title: "Workout Log",
      description: "Track every rep, set, and weight",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/workout-log"
    },
    {
      icon: History,
      title: "Workout History", 
      description: "Review your training progress",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      link: "/workout-history"
    },
    {
      icon: Target,
      title: "Workout Routines",
      description: "Build your perfect training plan",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/routines"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Visualize your fitness gains",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      link: "/progress-tracker"
    }
  ];

  return (
    <section id="features" className="py-16 bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.03),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.03),transparent_50%)]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-4 py-2 rounded-full text-sm font-semibold border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            Core Features
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-clip-text">
              Achieve Your Goals
            </span>
          </h2>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Powerful tools designed for real results. Our platform adapts to your fitness journey.
          </p>
        </div>

        {/* Compact Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon;
            
            return (
              <Link 
                key={feature.title}
                to={feature.link}
                className="group"
              >
                <Card className="h-full p-6 hover:shadow-lg hover:shadow-primary/5 border-border/40 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-0">
                    <div className="space-y-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-6 h-6 ${feature.color}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                      
                      {/* Arrow */}
                      <div className="flex justify-end">
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-flex flex-col items-center space-y-3">
            <Link to="/signup">
              <Button 
                variant="default" 
                size="lg" 
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white px-8 py-4 text-base font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <Zap className="w-5 h-5 mr-2" />
                Start Your Fitness Journey
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Join thousands achieving their fitness goals
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;