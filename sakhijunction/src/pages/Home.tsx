
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { Users, MessageSquare, CalendarIcon, BookOpen, Bell, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      icon: <Users className="h-7 w-7 text-brand" />,
      title: "Anonymous Health Discussions",
      description: "A secure, women-only community where users can discuss PCOS, cancer, menstrual health, and more without fear of judgment."
    },
    {
      icon: <MessageSquare className="h-7 w-7 text-brand" />,
      title: "Smart Chatbox",
      description: "A smart assistant trained in women's health, mental well-being, and myth-busting, providing instant, science-backed guidance."
    },
    {
      icon: <CalendarIcon className="h-7 w-7 text-brand" />,
      title: "Cycle & Wellness Tracker",
      description: "An easy-to-use menstrual and symptom tracker that offers personalized insights and self-care tips."
    },
    {
      icon: <BookOpen className="h-7 w-7 text-brand" />,
      title: "Empowering Articles & Posts",
      description: "A curated collection of blogs, stories, and expert insights written by and for women."
    },
    {
      icon: <Bell className="h-7 w-7 text-brand" />,
      title: "'Her Voice' Self-Care Messages",
      description: "A unique personal motivation system that allows users to set up scheduled voice/text messages for self-care."
    },
    {
      icon: <Heart className="h-7 w-7 text-brand" />,
      title: "Holistic Wellness Resources",
      description: "Access to resources covering physical health, mental wellness, nutrition, and self-defense tips."
    }
  ];

  return (
    <AppLayout>
      <section className="relative py-20 px-4 md:py-32 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-brand/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-100/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 slideRight">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="text-brand">सखी</span>{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Junction
                  </span>
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-brand to-purple-400 rounded-full"></div>
              </div>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                Empowering women through{" "}
                <span className="text-brand font-semibold">safe community discussions</span>,{" "}
                <span className="text-purple-600 font-semibold">AI-powered health guidance</span>, and{" "}
                <span className="text-pink-600 font-semibold">holistic wellness solutions</span>.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/community">
                  <Button size="lg" className="bg-gradient-to-r from-brand to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 text-lg font-semibold">
                    Join Our Community
                    <Heart className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/health-tracker">
                  <Button variant="outline" size="lg" className="border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all duration-300 px-8 py-3 text-lg font-semibold">
                    Start Wellness Journey
                    <CalendarIcon className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-8 pt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-brand">10K+</div>
                  <div className="text-sm text-muted-foreground">Women Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">500+</div>
                  <div className="text-sm text-muted-foreground">Health Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-600">24/7</div>
                  <div className="text-sm text-muted-foreground">AI Support</div>
                </div>
              </div>
            </div>
            <div className="hidden md:block fadeIn">
              <div className="w-full aspect-square bg-muted rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="data:image/jpeg;base64,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" 
                  alt="Sakhi Junction" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 staggered">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
