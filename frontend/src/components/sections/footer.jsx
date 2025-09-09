import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin } from "lucide-react";
import profilePicture from "@/assets/profile-picture.jpg";

export function Footer() {
  return (
    <footer className="bg-card/50 backdrop-blur-xl border-t border-glass-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden">
                <img 
                  src={profilePicture} 
                  alt="Chia Ranchber" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold hero-text">Chia Ranchber</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Transform your fitness journey with AI-powered workouts and personalized tracking.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0" asChild>
                <a href="https://www.linkedin.com/in/chia-ranchber-36b491291" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-4 h-4" />
                </a>
              </Button>
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0" asChild>
                <a href="https://github.com/Chia213" target="_blank" rel="noopener noreferrer">
                  <Github className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Workouts */}
          <div className="space-y-4">
            <h3 className="font-semibold">Workouts</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/workout-generator" className="text-muted-foreground hover:text-foreground transition-colors">Workout Generator</a></li>
              <li><a href="/ai-workout-generator" className="text-muted-foreground hover:text-foreground transition-colors">AI Workout Generator</a></li>
              <li><a href="/workout-log" className="text-muted-foreground hover:text-foreground transition-colors">Workout Log</a></li>
              <li><a href="/routines" className="text-muted-foreground hover:text-foreground transition-colors">My Routines</a></li>
              <li><a href="/custom-exercises" className="text-muted-foreground hover:text-foreground transition-colors">Custom Exercises</a></li>
            </ul>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h3 className="font-semibold">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/fitness-calculator" className="text-muted-foreground hover:text-foreground transition-colors">Fitness Calculator</a></li>
              <li><a href="/nutrition" className="text-muted-foreground hover:text-foreground transition-colors">Nutrition</a></li>
              <li><a href="/progress-tracker" className="text-muted-foreground hover:text-foreground transition-colors">Progress Tracker</a></li>
              <li><a href="/explore-muscle-guide" className="text-muted-foreground hover:text-foreground transition-colors">Muscle Guide</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</a></li>
              <li><a href="/faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
              <li><a href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-glass-border" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 Chia Ranchber. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/cookies" className="hover:text-foreground transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
