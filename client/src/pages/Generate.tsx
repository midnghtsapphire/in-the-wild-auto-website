import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo, LogoPlaceholder } from "@/components/Logo";
import { Loader2, Send, Facebook, Linkedin, Instagram, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

/**
 * Main Dashboard - Content Creation & Social Media Marketing
 * Unified interface for managing reviews and social media posts
 */
export default function Generate() {
  const { user, loading: authLoading } = useAuth();
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState({
    facebook: false,
    linkedin: false,
    instagram: false,
    tiktok: false,
  });
  const [budget, setBudget] = useState("");
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/";
    return null;
  }

  const handlePublish = () => {
    if (!content.trim()) {
      toast.error("Please enter content to publish");
      return;
    }

    const selectedPlatforms = Object.entries(platforms)
      .filter(([_, selected]) => selected)
      .map(([platform, _]) => platform);

    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform");
      return;
    }

    toast.success(`Publishing to ${selectedPlatforms.join(", ")}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a>
              <Logo size="medium" showText={true} />
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {user.name || user.email}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-50">Create Content</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content" className="text-slate-700 dark:text-slate-300">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your review, post, or announcement..."
                    className="min-h-[200px] mt-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <Label className="text-slate-700 dark:text-slate-300 mb-3 block">Publish To</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <Checkbox
                        id="facebook"
                        checked={platforms.facebook}
                        onCheckedChange={(checked) =>
                          setPlatforms({ ...platforms, facebook: !!checked })
                        }
                      />
                      <label htmlFor="facebook" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                        <Facebook className="w-4 h-4" />
                        Facebook
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <Checkbox
                        id="linkedin"
                        checked={platforms.linkedin}
                        onCheckedChange={(checked) =>
                          setPlatforms({ ...platforms, linkedin: !!checked })
                        }
                      />
                      <label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <Checkbox
                        id="instagram"
                        checked={platforms.instagram}
                        onCheckedChange={(checked) =>
                          setPlatforms({ ...platforms, instagram: !!checked })
                        }
                      />
                      <label htmlFor="instagram" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                        <Instagram className="w-4 h-4" />
                        Instagram
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <Checkbox
                        id="tiktok"
                        checked={platforms.tiktok}
                        onCheckedChange={(checked) =>
                          setPlatforms({ ...platforms, tiktok: !!checked })
                        }
                      />
                      <label htmlFor="tiktok" className="flex items-center gap-2 text-sm font-medium cursor-pointer flex-1">
                        <TrendingUp className="w-4 h-4" />
                        TikTok
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-slate-700 dark:text-slate-300">
                    Marketing Budget (Optional)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter amount in USD"
                    className="mt-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Set a budget for promoted posts across platforms
                  </p>
                </div>

                <Button
                  onClick={handlePublish}
                  className="w-full bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publish Content
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Recent Posts</h3>
              <div className="text-center py-8 text-slate-500 dark:text-slate-500">
                No posts yet. Create your first post above!
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Brand Logo</h3>
              <LogoPlaceholder />
            </Card>

            <Card className="p-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Performance</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Total Posts</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">0</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Total Reach</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">0</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Engagement</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-50">0%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
