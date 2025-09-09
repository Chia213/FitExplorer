import { useState } from "react";
import { Link } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Mail,
  MessageCircle,
  BookOpen,
  Settings,
  BarChart3,
  User,
  Wrench,
  CheckCircle,
  Plus,
  Minus
} from "lucide-react";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ data
  const faqData = [
    {
      category: "General",
      icon: HelpCircle,
      gradient: "from-blue-500 to-purple-600",
      questions: [
        {
          id: 1,
          question: "What is FitExplorer?",
          answer: "FitExplorer is a comprehensive fitness tracking application that helps you plan your workouts, track your progress, and achieve your fitness goals. With features like workout logging, routine creation, progress tracking, and more, FitExplorer is your all-in-one fitness companion."
        },
        {
          id: 2,
          question: "Is FitExplorer free to use?",
          answer: "Yes, FitExplorer is currently free to use with all core features. We may introduce premium features in the future, but the current functionality will remain free."
        },
        {
          id: 3,
          question: "How do I create an account?",
          answer: "To create an account, click on the 'Sign Up' button in the top navigation bar. You'll need to provide a username, email address, and password. You can also sign up using your Google account for faster registration."
        },
        {
          id: 4,
          question: "Can I use FitExplorer on my mobile device?",
          answer: "Yes, FitExplorer is fully responsive and can be used on desktop, tablet, and mobile devices. Simply access the website on your mobile browser for a mobile-optimized experience."
        }
      ]
    },
    {
      category: "Workouts & Exercises",
      icon: BookOpen,
      gradient: "from-green-500 to-blue-600",
      questions: [
        {
          id: 5,
          question: "How do I log a workout?",
          answer: "To log a workout, navigate to the 'Workout Log' page from the navigation menu. Click on 'New Workout', enter the workout details including exercises, sets, reps, and weights, then save your workout."
        },
        {
          id: 6,
          question: "Can I create custom exercises?",
          answer: "Yes, you can create custom exercises if you can't find what you need in our exercise database. When logging a workout, click on 'Add Exercise' and then 'Create Custom Exercise' to add your own exercise with a name and category."
        },
        {
          id: 7,
          question: "What is the Workout Generator?",
          answer: "The Workout Generator is an AI-powered feature that creates personalized workout plans based on your fitness level, available equipment, and goals. It helps you discover new exercises and keeps your routine fresh and challenging."
        },
        {
          id: 8,
          question: "How do I create a routine?",
          answer: "To create a routine, go to the 'Routines' page, click 'New Routine', give it a name, and add exercises. Routines are reusable workout templates that save you time when logging similar workouts."
        }
      ]
    },
    {
      category: "Progress Tracking",
      icon: BarChart3,
      gradient: "from-purple-500 to-pink-600",
      questions: [
        {
          id: 9,
          question: "How can I track my progress?",
          answer: "Navigate to the 'Progress Tracker' page to view graphs and statistics about your workout history, strength gains, body measurements, and more. You can filter by date ranges and exercise types to get detailed insights."
        },
        {
          id: 10,
          question: "Can I track my body measurements?",
          answer: "Yes, you can track your body weight when logging workouts. This data is used to generate progress graphs in the Progress Tracker page."
        },
        {
          id: 11,
          question: "How do I set fitness goals?",
          answer: "You can set a goal weight in your profile settings. We're currently working on expanding our goal-setting features to include lifting targets, workout frequency goals, and more."
        }
      ]
    },
    {
      category: "Account & Settings",
      icon: Settings,
      gradient: "from-orange-500 to-red-600",
      questions: [
        {
          id: 12,
          question: "How do I change my password?",
          answer: "Go to your Profile page and click on 'Change Password'. You'll need to enter your current password and then your new password twice to confirm the change."
        },
        {
          id: 13,
          question: "Can I change my username or email?",
          answer: "You can change your username from the Profile page by clicking 'Edit Username'. Email addresses cannot be changed at this time for security reasons."
        },
        {
          id: 14,
          question: "How do I delete my account?",
          answer: "To delete your account, go to your Profile page and scroll to the bottom. Click on 'Delete Account' and follow the confirmation steps. Please note that account deletion is permanent and all your data will be removed."
        },
        {
          id: 15,
          question: "How do I enable email notifications?",
          answer: "Go to your Profile page, find the Preferences section, and toggle on 'Email Notifications'. You can select the frequency of summary emails (weekly or monthly)."
        }
      ]
    },
    {
      category: "Technical Support",
      icon: Wrench,
      gradient: "from-cyan-500 to-blue-600",
      questions: [
        {
          id: 16,
          question: "I found a bug. How do I report it?",
          answer: "We appreciate bug reports! Please contact us at fitexplorer.fitnessapp@gmail.com with as much detail as possible about the issue you're experiencing, including steps to reproduce it."
        },
        {
          id: 17,
          question: "Is my data secure?",
          answer: "Yes, we take data security seriously. All personal data is encrypted, and we never share your information with third parties without your consent. See our Privacy Policy for more details."
        },
        {
          id: 18,
          question: "How do I request a new feature?",
          answer: "We love hearing from our users! Send your feature requests to fitexplorer.fitnessapp@gmail.com. We regularly review suggestions and incorporate them into our development roadmap."
        }
      ]
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Filter questions based on search query
  const filteredFAQs = faqData.map(category => {
    const filteredQuestions = category.questions.filter(item => 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return {
      ...category,
      questions: filteredQuestions
    };
  }).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="space-y-6 animate-fade-in-up">
            <Badge variant="outline" className="border-primary/50 text-primary mb-4">
              Help & Support
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold hero-text mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Find answers to common questions about FitExplorer. 
              Can't find what you're looking for? Contact us directly.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card p-8">
            <CardContent className="p-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg bg-background border border-glass-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {filteredFAQs.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <CardContent className="p-0">
                <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-semibold mb-4 text-foreground">No results found</h2>
                <p className="text-muted-foreground mb-6">
                  We couldn't find any FAQs matching your search. Try different keywords or browse all questions below.
                </p>
                <Button 
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                >
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {filteredFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="feature-card">
                  <CardContent className="p-0">
                    <div className="p-8 border-b border-glass-border">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.gradient} flex items-center justify-center`}>
                          <category.icon className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-semibold text-foreground">
                          {category.category}
                        </h2>
                        <Badge variant="secondary" className="ml-auto">
                          {category.questions.length} questions
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-glass-border">
                      {category.questions.map((item, index) => {
                        const currentIndex = `${categoryIndex}-${index}`;
                        const isActive = activeIndex === currentIndex;
                        
                        return (
                          <div key={item.id} className="p-6">
                            <button
                              onClick={() => toggleAccordion(currentIndex)}
                              className="w-full text-left flex justify-between items-start space-x-4 group"
                            >
                              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
                                {item.question}
                              </h3>
                              <div className="flex-shrink-0">
                                {isActive ? (
                                  <Minus className="w-5 h-5 text-primary" />
                                ) : (
                                  <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                              </div>
                            </button>
                            
                            <div
                              className={`overflow-hidden transition-all duration-300 ${
                                isActive ? "max-h-screen mt-4" : "max-h-0"
                              }`}
                            >
                              <div className="pt-4 border-t border-glass-border">
                                <p className="text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card p-12 text-center glow-effect">
            <CardContent className="p-0">
              <h2 className="text-3xl font-bold mb-6 hero-text">
                Still Have Questions?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                If you couldn't find the answer to your question, feel free to contact us directly. 
                We're here to help!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                  <a href="mailto:fitexplorer.fitnessapp@gmail.com">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Support
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Page
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-2xl font-semibold mb-6 text-foreground">Related Pages</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/about">About Us</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/terms">Terms of Service</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p className="text-muted-foreground">
            © 2025 Chia Ranchber. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FAQ;