import { Linkedin, Github } from "lucide-react";
import profilePicture from "../assets/profile-picture.jpg";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Personal Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                <img 
                  src={profilePicture} 
                  alt="Chia Ranchber" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-semibold text-primary">Chia Ranchber</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Transform your fitness goals into reality with intelligent training and data-driven progress.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://www.linkedin.com/in/chia-ranchber-36b491291/" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-[#0077B5]/10 transition-colors group"
              >
                <Linkedin className="w-4 h-4 text-[#0077B5] group-hover:text-[#0077B5] dark:text-[#0A66C2] dark:group-hover:text-[#0A66C2]" />
              </a>
              <a 
                href="https://github.com/Chia213" 
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
              >
                <Github className="w-4 h-4 text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-300" />
              </a>
            </div>
          </div>

          {/* Workouts Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Workouts</h3>
            <ul className="space-y-2">
              <li>
                <a href="/workout-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Workout Generator
                </a>
              </li>
              <li>
                <a href="/ai-workout-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  AI Workout Generator
                </a>
              </li>
              <li>
                <a href="/workout-log" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Workout Log
                </a>
              </li>
              <li>
                <a href="/routines" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  My Routines
                </a>
              </li>
              <li>
                <a href="/custom-exercises" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Custom Exercises
                </a>
              </li>
            </ul>
          </div>

          {/* Tools Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Tools</h3>
            <ul className="space-y-2">
              <li>
                <a href="/fitness-calculator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Fitness Calculator
                </a>
              </li>
              <li>
                <a href="/nutrition" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Nutrition
                </a>
              </li>
              <li>
                <a href="/progress-tracker" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Progress Tracker
                </a>
              </li>
              <li>
                <a href="/muscle-guide" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Muscle Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-6 flex justify-center">
          <p className="text-sm text-muted-foreground">
            © 2024 FitExplorer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
