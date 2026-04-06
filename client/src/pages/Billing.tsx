import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Loader2, CheckCircle2, Star, Building2, ArrowLeft, Zap } from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    monthlyTokens: 50000,
    icon: Zap,
    color: "slate",
    features: [
      "50,000 tokens / month",
      "2 free LLM models",
      "Basic website generation",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    monthlyTokens: 500000,
    icon: Star,
    color: "purple",
    popular: true,
    features: [
      "500,000 tokens / month",
      "Premium LLM models",
      "Full-stack generation",
      "Mobile app generation",
      "Custom domains",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 99,
    monthlyTokens: 5000000,
    icon: Building2,
    color: "green",
    features: [
      "5,000,000 tokens / month",
      "All Pro features",
      "Unlimited API calls",
      "Dedicated support",
      "SLA guarantee",
      "Team collaboration",
    ],
  },
] as const;

export default function Billing() {
  const { user, loading: authLoading } = useAuth();

  const usageQuery = trpc.billing.getUsage.useQuery();
  const plansQuery = trpc.billing.getPlans.useQuery();

  const checkoutMutation = trpc.billing.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toast.success("Subscription updated!");
      }
    },
    onError: (err) => toast.error(err.message || "Failed to start checkout"),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-950 via-slate-900 to-green-950">
        <Loader2 className="w-12 h-12 animate-spin text-green-400" />
      </div>
    );
  }

  if (!user) {
    window.location.href = "/";
    return null;
  }

  const currentTier = usageQuery.data?.tier || "free";
  const tokensUsed = usageQuery.data?.tokensUsed || 0;
  const monthlyLimit = usageQuery.data?.monthlyLimit || 50000;
  const percentageUsed = usageQuery.data?.percentageUsed || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-green-950 text-white">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <a className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">My Projects</span>
              </a>
            </Link>
            <div className="w-px h-6 bg-slate-700" />
            <Logo size="sm" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Subscription & Billing</h2>
          <p className="text-slate-400">Choose the plan that fits your needs.</p>
        </div>

        {/* Current Usage */}
        <Card className="bg-black/40 border-purple-500/20 p-6 mb-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-slate-400">Token Usage This Month</div>
              <div className="text-2xl font-bold text-white">
                {tokensUsed.toLocaleString()} <span className="text-slate-500 text-lg font-normal">/ {monthlyLimit.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 capitalize text-sm">
                {currentTier} Plan
              </Badge>
              <div className="text-sm text-slate-400 mt-1">{percentageUsed.toFixed(1)}% used</div>
            </div>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-green-500 transition-all"
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          {usageQuery.data?.resetDate && (
            <p className="text-xs text-slate-500 mt-2">
              Resets {new Date(usageQuery.data.resetDate).toLocaleDateString()}
            </p>
          )}
        </Card>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentTier === plan.id;
            const PlanIcon = plan.icon;

            return (
              <Card
                key={plan.id}
                className={`relative bg-black/40 p-6 flex flex-col gap-5 transition-all ${
                  plan.id === "pro"
                    ? "border-purple-500/50 ring-1 ring-purple-500/30"
                    : "border-purple-500/20 hover:border-purple-500/40"
                }`}
              >
                {plan.id === "pro" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-purple-600 to-green-600 text-white border-0 text-xs px-3">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    plan.id === "pro"
                      ? "bg-purple-500/20"
                      : plan.id === "business"
                      ? "bg-green-500/20"
                      : "bg-slate-500/20"
                  }`}>
                    <PlanIcon className={`w-5 h-5 ${
                      plan.id === "pro" ? "text-purple-400" : plan.id === "business" ? "text-green-400" : "text-slate-400"
                    }`} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{plan.name}</div>
                    <div className="text-2xl font-bold text-white mt-0.5">
                      {plan.price === 0 ? (
                        "Free"
                      ) : (
                        <>
                          ${plan.price}
                          <span className="text-sm font-normal text-slate-400">/mo</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.id === "pro" ? "text-purple-400" : plan.id === "business" ? "text-green-400" : "text-slate-500"
                      }`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => {
                    if (isCurrentPlan) return;
                    checkoutMutation.mutate({ planId: plan.id });
                  }}
                  disabled={isCurrentPlan || checkoutMutation.isPending}
                  className={
                    isCurrentPlan
                      ? "bg-slate-700 text-slate-400 cursor-default"
                      : plan.id === "pro"
                      ? "bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700"
                      : "border border-purple-500/50 text-purple-300 hover:bg-purple-500/10 bg-transparent"
                  }
                  variant={plan.id === "pro" || isCurrentPlan ? "default" : "outline"}
                >
                  {checkoutMutation.isPending && checkoutMutation.variables?.planId === plan.id ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  {isCurrentPlan ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-slate-500 text-sm mt-8">
          All plans include access to the InTheWild full-stack generator. Cancel anytime.
        </p>
      </main>
    </div>
  );
}
