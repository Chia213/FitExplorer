import { Link } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield, 
  Lock, 
  User, 
  Globe, 
  Cookie, 
  History, 
  Trash2, 
  Mail,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Info,
  Eye,
  Database,
  Settings
} from "lucide-react";

const PrivacyPolicy = () => {
  const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const privacyPrinciples = [
    { text: "Your data is encrypted and secure", icon: Shield },
    { text: "We never sell your personal information", icon: Lock },
    { text: "You control your data", icon: User },
    { text: "Transparent about data usage", icon: Eye }
  ];

  const sections = [
    {
      icon: User,
      title: "Information We Collect",
      gradient: "from-blue-500 to-purple-600",
      content: [
        {
          subtitle: "Personal Information",
          items: [
            "Contact information (name, email address)",
            "Account credentials (username, password)",
            "Profile information (age, gender, height, weight, profile picture)",
            "Fitness goals and preferences"
          ]
        },
        {
          subtitle: "Fitness and Health Data",
          items: [
            "Workout history and exercise records",
            "Performance metrics (sets, reps, weights, duration)",
            "Body measurements and weight tracking data",
            "Notes and feedback about workouts"
          ]
        },
        {
          subtitle: "Device and Usage Information",
          items: [
            "Device type, operating system, and browser information",
            "IP address and approximate location based on IP",
            "Usage patterns and feature interactions",
            "Login dates and session durations"
          ]
        }
      ]
    },
    {
      icon: Globe,
      title: "How We Use Your Information",
      gradient: "from-green-500 to-blue-600",
      content: [
        {
          subtitle: "Service Provision",
          items: [
            "Providing and improving FitExplorer functionality",
            "Creating personalized workout recommendations",
            "Tracking your fitness progress",
            "Enhancing your user experience"
          ]
        },
        {
          subtitle: "Account Management",
          items: [
            "Creating and managing your account",
            "Authenticating your identity when you log in",
            "Maintaining your user profile",
            "Providing customer support"
          ]
        },
        {
          subtitle: "Analytics and Security",
          items: [
            "Analyzing usage patterns and optimizing performance",
            "Troubleshooting technical issues",
            "Detecting and preventing fraudulent activities",
            "Ensuring platform security"
          ]
        }
      ]
    },
    {
      icon: Lock,
      title: "Information Sharing",
      gradient: "from-purple-500 to-pink-600",
      content: [
        {
          subtitle: "Limited Sharing",
          items: [
            "Service providers who perform services on our behalf",
            "With your explicit consent for specific purposes",
            "When required by law or valid legal requests",
            "In case of business transfers (with prior notice)"
          ]
        },
        {
          subtitle: "We Never Share",
          items: [
            "Your personal information for marketing purposes",
            "Your health and fitness data without consent",
            "Your data with third parties for advertising",
            "Your information for any unauthorized purposes"
          ]
        }
      ]
    },
    {
      icon: Shield,
      title: "Data Security",
      gradient: "from-orange-500 to-red-600",
      content: [
        {
          subtitle: "Security Measures",
          items: [
            "Encryption of sensitive data at rest and in transit (HTTPS/TLS)",
            "Regular security assessments and vulnerability scanning",
            "Secure password hashing and authentication protocols",
            "Limited access to personal information by authorized personnel only"
          ]
        },
        {
          subtitle: "Protection Standards",
          items: [
            "Data backup and disaster recovery procedures",
            "Industry-standard security practices",
            "Regular security training for our team",
            "Continuous monitoring of our systems"
          ]
        }
      ]
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking",
      gradient: "from-cyan-500 to-blue-600",
      content: [
        {
          subtitle: "Cookie Types",
          items: [
            "Essential cookies for basic platform functionality",
            "Analytics cookies to understand user interactions",
            "Functionality cookies for enhanced features",
            "Preference cookies to remember your settings"
          ]
        },
        {
          subtitle: "Your Control",
          items: [
            "Manage cookie preferences through browser settings",
            "Disable non-essential cookies if desired",
            "Clear cookies at any time",
            "Opt-out of analytics tracking"
          ]
        }
      ]
    },
    {
      icon: User,
      title: "Your Rights & Choices",
      gradient: "from-yellow-500 to-orange-600",
      content: [
        {
          subtitle: "Data Rights",
          items: [
            "Access and receive a copy of your personal information",
            "Request correction of inaccurate or incomplete data",
            "Request deletion of your personal information",
            "Object to or restrict the processing of your data"
          ]
        },
        {
          subtitle: "Additional Rights",
          items: [
            "Data portability (receive your data in a structured format)",
            "Withdraw consent at any time",
            "Request information about data processing",
            "File a complaint with supervisory authorities"
          ]
        }
      ]
    },
    {
      icon: History,
      title: "Data Retention",
      gradient: "from-indigo-500 to-purple-600",
      content: [
        {
          subtitle: "Retention Period",
          items: [
            "Retained for as long as necessary to fulfill our purposes",
            "Longer retention for legal, tax, or regulatory reasons",
            "Consideration of data amount, nature, and sensitivity",
            "Assessment of potential risks from unauthorized use"
          ]
        },
        {
          subtitle: "Data Deletion",
          items: [
            "Secure destruction when no longer needed",
            "Anonymization when possible",
            "Immediate deletion upon account closure",
            "Regular review of retention periods"
          ]
        }
      ]
    },
    {
      icon: Globe,
      title: "International Transfers",
      gradient: "from-teal-500 to-cyan-600",
      content: [
        {
          subtitle: "Global Operations",
          items: [
            "Information may be transferred to other countries",
            "Different data protection laws may apply",
            "Appropriate safeguards ensure continued protection",
            "Standard contractual clauses for international transfers"
          ]
        },
        {
          subtitle: "Protection Measures",
          items: [
            "Data transfer agreements with standard clauses",
            "Privacy Shield certification where applicable",
            "Vendor and partner security assessments",
            "Regular review of transfer mechanisms"
          ]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="space-y-6 animate-fade-in-up">
            <Badge variant="outline" className="border-primary/50 text-primary mb-4">
              Privacy & Data Protection
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold hero-text mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Your privacy is important to us. This document explains how we
              collect, use, and protect your personal information with transparency and care.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {lastUpdated}</span>
          </div>
              </div>
              </div>
            </section>

      {/* Privacy Principles */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
            {privacyPrinciples.map((principle, index) => (
              <Card key={index} className="glass-card text-center p-6">
                <CardContent className="p-0">
                  <principle.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-sm font-medium text-foreground">{principle.text}</div>
                </CardContent>
              </Card>
            ))}
                </div>
              </div>
            </section>

      {/* Introduction */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="glass-card p-12 animate-scale-in">
            <h2 className="text-4xl font-bold mb-6 hero-text">Our Privacy Commitment</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              At FitExplorer, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our fitness platform.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div className="text-left">
                  <p className="text-primary font-semibold mb-2">Important Notice</p>
                  <p className="text-muted-foreground">
                    We will never use your health and fitness data for advertising purposes or 
                    sell it to third parties without your explicit consent.
                  </p>
                </div>
              </div>
            </div>
              </div>
              </div>
            </section>

      {/* Privacy Sections */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 hero-text">Privacy Details</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive information about how we handle your personal data
                </p>
              </div>
          
          <div className="space-y-8">
            {sections.map((section, index) => (
              <Card key={index} className="feature-card">
                <CardContent className="p-8">
                  <div className="flex items-start space-x-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${section.gradient} flex items-center justify-center flex-shrink-0`}>
                      <section.icon className="w-8 h-8 text-white" />
              </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-6 text-foreground">
                        {section.title}
                      </h3>
                      <div className="space-y-6">
                        {section.content.map((subsection, subIndex) => (
                          <div key={subIndex}>
                            <h4 className="text-lg font-semibold mb-3 text-foreground">
                              {subsection.subtitle}
                            </h4>
                            <ul className="space-y-2">
                              {subsection.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex items-start space-x-2 text-muted-foreground">
                                  <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                                  <span>{item}</span>
                  </li>
                              ))}
                </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
              </div>
            </section>

      {/* Changes to Policy */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card p-12">
            <CardContent className="p-0">
              <h2 className="text-3xl font-bold mb-8 hero-text text-center">Changes to This Policy</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Info className="w-4 h-4 text-primary" />
              </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Policy Updates</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      We may update this Privacy Policy from time to time to reflect changes in our 
                      practices or for other operational, legal, or regulatory reasons. The revised 
                      policy will be effective immediately upon posting on our website.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      We will notify you of any material changes by posting a notice on our website, 
                      sending an email to the address associated with your account, or displaying a 
                      notification when you access our platform.
                </p>
              </div>
                </div>
              </div>
            </CardContent>
          </Card>
              </div>
            </section>

      {/* Contact Information */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card p-12">
            <CardContent className="p-0">
              <h2 className="text-3xl font-bold mb-8 hero-text text-center">Contact Us</h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-4 h-4 text-accent" />
              </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Privacy Questions</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      If you have any questions, concerns, or requests regarding this Privacy Policy 
                      or our privacy practices, please contact us:
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="outline" asChild>
                        <a href="mailto:fitexplorer.fitnessapp@gmail.com">
                          <Mail className="w-4 h-4 mr-2" />
                          Email Support
                        </a>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/contact">Contact Page</Link>
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      We will respond to your inquiry within 30 days.
                    </p>
                  </div>
                </div>
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
              <Link to="/terms">Terms of Service</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/about">About Us</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/faq">FAQ</Link>
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

export default PrivacyPolicy;
