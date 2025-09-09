import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Target, Users, Zap, Calendar } from "lucide-react";
import aiWorkoutIcon from "@/assets/ai-workout-icon.jpg";
import progressIcon from "@/assets/progress-icon.jpg";
import personalizedIcon from "@/assets/personalized-icon.jpg";

const features = [
  {
    icon: Brain,
    image: aiWorkoutIcon,
    title: "AI Workout Generator",
    description: "Personalized activities based on your fitness level, goals, and available equipment.",
    badge: "AI Powered",
    color: "text-blue-400"
  },
  {
    icon: TrendingUp,
    image: progressIcon,
    title: "Progress Tracking",
    description: "Advanced analytics and insights to monitor your fitness journey and celebrate milestones.",
    badge: "Analytics",
    color: "text-green-400"
  },
  {
    icon: Target,
    image: personalizedIcon,
    title: "Personalized Plans",
    description: "Custom workout routines tailored to your schedule, preferences, and fitness objectives.",
    badge: "Custom",
    color: "text-purple-400"
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with fellow fitness enthusiasts, share achievements, and stay motivated together.",
    badge: "Social",
    color: "text-orange-400"
  },
  {
    icon: Zap,
    title: "Quick Workouts",
    description: "Efficient 10-30 minute sessions perfect for busy schedules without compromising results.",
    badge: "Fast",
    color: "text-yellow-400"
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Intelligent workout planning that adapts to your calendar and energy levels.",
    badge: "Smart",
    color: "text-cyan-400"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge variant="outline" className="mb-4 border-glass-border">
            Core Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything you need to{" "}
            <span className="hero-text">achieve your goals</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powered by advanced technology and designed for real results. 
            Our comprehensive platform adapts to your unique fitness journey.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className="feature-card glow-effect group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                {/* Feature Image/Icon */}
                <div className="relative h-48 rounded-t-xl overflow-hidden bg-gradient-to-br from-muted/50 to-muted/30">
                  {feature.image ? (
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <feature.icon className={`w-16 h-16 ${feature.color}`} />
                    </div>
                  )}
                  
                  <Badge 
                    variant="secondary" 
                    className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm"
                  >
                    {feature.badge}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
