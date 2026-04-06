import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { getLoginUrl } from "@/const";
import { BRANDING } from "@/lib/branding";
import { Star, Users, TrendingUp, CheckCircle2 } from "lucide-react";

/**
 * Reese-Reviews Landing Page
 * Clean, professional design with steel/neutral branding
 */
export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  if (user) {
    // Redirect to dashboard if logged in
    window.location.href = "/generate";
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="medium" showText={true} />
          <a href={getLoginUrl()}>
            <Button variant="outline" className="border-slate-300 dark:border-slate-700">
              Sign In
            </Button>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Headline */}
          <div className="space-y-4">
            <div className="inline-block px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300 mb-4">
              {BRANDING.TAGLINE}
            </div>
            <h2 className="text-5xl md:text-6xl font-bold leading-tight text-slate-900 dark:text-slate-50">
              Expert Reviews &{" "}
              <span className="text-slate-600 dark:text-slate-400">
                Curated Content
              </span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Authentic reviews and insights you can trust. Professional content creation and social media management.
            </p>
          </div>

          {/* CTA */}
          <div className="flex gap-4 justify-center">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-8 py-6 text-lg">
                <Star className="w-5 h-5 mr-2" />
                Get Started
              </Button>
            </a>
          </div>

          {/* Key Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Expert Reviews</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                In-depth, honest reviews from industry professionals
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Social Media</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Automated posting to Facebook, LinkedIn, Instagram, and TikTok
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 space-y-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Analytics
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Track performance and engagement across all platforms
              </p>
            </div>
          </div>

          {/* What You Get */}
          <div className="mt-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-8 text-left">
            <h3 className="text-2xl font-bold text-center mb-8 text-slate-900 dark:text-slate-50">
              Features
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Professional content creation",
                "Multi-platform publishing",
                "Engagement analytics",
                "Automated scheduling",
                "Budget management",
                "Performance tracking",
                "Content management",
                "Social media integration",
              ].map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-slate-600 dark:text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-16 space-y-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Get Started Today</h3>
            <p className="text-slate-600 dark:text-slate-400">
              Professional reviews and content management made simple
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700">
                Create Account
              </Button>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600 dark:text-slate-400 text-sm">
          <p>{BRANDING.APP_NAME} © 2026 • {BRANDING.TAGLINE}</p>
        </div>
      </footer>
    </div>
  );
}
