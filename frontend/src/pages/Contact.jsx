import { Navigation } from "@/components/ui/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Linkedin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create mailto link with form data
    const subject = encodeURIComponent(formData.subject || 'Contact from FitExplorer');
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:fitexplorer.fitnessapp@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="space-y-6 animate-fade-in-up">
            <Badge variant="outline" className="border-primary/50 text-primary mb-4">
              Get in Touch
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold hero-text mb-6">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Have questions, feedback, or need support? We'd love to hear from you. 
              Reach out and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card className="glass-card p-8">
              <CardContent className="p-0">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-glass-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-glass-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-glass-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="What's this about?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-glass-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="glass-card p-8">
                <CardContent className="p-0">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Get in Touch</h2>
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Email Us</h3>
                        <p className="text-muted-foreground mb-2">
                          Send us an email and we'll respond within 24 hours.
                        </p>
                        <a 
                          href="mailto:fitexplorer.fitnessapp@gmail.com"
                          className="text-primary hover:underline"
                        >
                          fitexplorer.fitnessapp@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                        <Linkedin className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">LinkedIn</h3>
                        <p className="text-muted-foreground mb-2">
                          Connect with us on LinkedIn for updates and networking.
                        </p>
                        <a 
                          href="https://www.linkedin.com/in/chia-ranchber-36b491291"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          linkedin.com/in/chia-ranchber-36b491291
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                        <MessageCircle className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Response Time</h3>
                        <p className="text-muted-foreground">
                          We typically respond to all inquiries within 24 hours during business days.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card p-6">
                <CardContent className="p-0">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
                  <p className="text-muted-foreground mb-4">
                    Before reaching out, you might find answers to common questions in our FAQ section.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="/faq">Visit FAQ</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
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

export default Contact;
