import { Link } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  UserCheck, 
  CreditCard, 
  AlertTriangle, 
  Ban, 
  Scale, 
  FileText, 
  Mail,
  Calendar,
  CheckCircle,
  Info
} from "lucide-react";

const TermsOfService = () => {
  const sections = [
    {
      icon: UserCheck,
      title: "1. User Agreement",
      content: "By accessing or using FitExplorer, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service. Your use of the service is also subject to our Privacy Policy, which can be found at our Privacy Policy page.",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "2. Account Registration",
      content: "To use certain features of FitExplorer, you may be required to register for an account. You agree to provide accurate and complete information during the registration process and to update such information to keep it accurate and current. You are responsible for safeguarding your password and for all activities that occur under your account.",
      gradient: "from-green-500 to-blue-600"
    },
    {
      icon: FileText,
      title: "3. Privacy & Data Protection",
      content: "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal information. By using FitExplorer, you consent to our collection and use of personal data as outlined in our Privacy Policy. We implement industry-standard security measures to protect your data.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: CreditCard,
      title: "4. Payments and Subscriptions",
      content: "FitExplorer may offer paid services or features. By subscribing to a paid service, you agree to pay the specified fees. We may change our fees at any time, but will provide notice of the changes before they take effect. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: Scale,
      title: "5. Acceptable Use Policy",
      content: "You agree not to use FitExplorer for any unlawful purposes or to conduct any unlawful activity. You may not engage in any activity that interferes with or disrupts the service or servers and networks connected to the service. You agree not to post or transmit any material that is abusive, harassing, tortious, defamatory, or invasive of another's privacy.",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: AlertTriangle,
      title: "6. Health & Safety Disclaimer",
      content: "FitExplorer provides fitness and nutrition information for educational purposes only. The content is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or before beginning any new exercise or nutrition program.",
      gradient: "from-yellow-500 to-orange-600"
    },
    {
      icon: Ban,
      title: "7. Account Termination",
      content: "We may terminate or suspend your account and access to FitExplorer immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service. Upon termination, your right to use the service will immediately cease. You may also terminate your account at any time by contacting us.",
      gradient: "from-red-500 to-pink-600"
    },
    {
      icon: Scale,
      title: "8. Governing Law & Disputes",
      content: "These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which FitExplorer is established, without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in that jurisdiction.",
      gradient: "from-indigo-500 to-purple-600"
    }
  ];

  const keyPoints = [
    { text: "Free to use with optional premium features", icon: CheckCircle },
    { text: "Your data is protected with enterprise-grade security", icon: Shield },
    { text: "24/7 customer support available", icon: Mail },
    { text: "Regular updates and improvements", icon: Calendar }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="space-y-6 animate-fade-in-up">
            <Badge variant="outline" className="border-primary/50 text-primary mb-4">
              Legal Information
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold hero-text mb-6">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Our commitment to transparency, fairness, and your rights as a user. 
              Please read these terms carefully to understand your rights and responsibilities.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Points */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
            {keyPoints.map((point, index) => (
              <Card key={index} className="glass-card text-center p-6">
                <CardContent className="p-0">
                  <point.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <div className="text-sm font-medium text-foreground">{point.text}</div>
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
            <h2 className="text-4xl font-bold mb-6 hero-text">Welcome to FitExplorer</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              These Terms of Service govern your use of the FitExplorer platform, including our website, 
              mobile application, and all related services. Please read these terms carefully before using FitExplorer.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              By accessing or using our service, you agree to be bound by these Terms. If you disagree with 
              any part of the terms, you may not access the service.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Sections */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 hero-text">Terms & Conditions</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Detailed information about your rights and responsibilities when using FitExplorer
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
                      <h3 className="text-2xl font-semibold mb-4 text-foreground">
                        {section.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Information */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="glass-card p-12">
            <CardContent className="p-0">
              <h2 className="text-3xl font-bold mb-8 hero-text text-center">Additional Information</h2>
              
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Modifications</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      We reserve the right to modify these Terms at any time. We will provide notice of any 
                      material changes through the service or by other means. Your continued use of FitExplorer 
                      after such modifications will constitute your acknowledgment of the modified Terms.
                    </p>
                  </div>
                </div>

                <Separator className="bg-glass-border" />

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Contact Information</h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      If you have any questions about these Terms, please contact us:
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
              <Link to="/privacy-policy">Privacy Policy</Link>
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

export default TermsOfService;