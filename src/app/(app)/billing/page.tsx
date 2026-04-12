import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { CreditCard, Download, ArrowRight } from "lucide-react";

import { getUserSubscriptions, getUserPaymentHistory } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const PLANS = {
  basic: {
    name: "Basic",
    price: 5.99,
    features: ["SD Quality (480p)", "1 Screen", "Basic Support"],
  },
  standard: {
    name: "Standard",
    price: 9.99,
    features: ["Full HD Quality (1080p)", "2 Screens", "Priority Support"],
  },
  premium: {
    name: "Premium",
    price: 14.99,
    features: ["4K Quality", "4 Screens", "24/7 Premium Support"],
  },
};

function getStatusColor(
  status: "active" | "cancelled" | "past_due" | "paused"
) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300";
    case "cancelled":
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300";
    case "past_due":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";
    case "paused":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
}

export default async function BillingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const subscriptions = await getUserSubscriptions();
  const paymentHistory = await getUserPaymentHistory();
  const activeSubscription = subscriptions.find((sub) => sub.status === "active");

  return (
    <div className="min-h-screen bg-linear-to-br from-ott-bg-primary to-ott-bg-secondary dark:from-black dark:to-ott-bg-secondary">
      <div className="ott-shell py-6 sm:py-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-ott-text-primary mb-2">
              Billing & Subscription
            </h1>
            <p className="text-ott-text-secondary">
              Manage your subscription plan and payment methods
            </p>
          </div>

          {/* Current Subscription */}
          {activeSubscription ? (
            <Card className="mb-6 border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Current Plan</CardTitle>
                    <CardDescription>
                      Your active subscription details
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(activeSubscription.status)}>
                    {activeSubscription.status.charAt(0).toUpperCase() +
                      activeSubscription.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
                  <div>
                    <p className="text-sm text-ott-text-secondary">Plan Name</p>
                    <p className="text-lg font-semibold text-ott-text-primary">
                      {activeSubscription.plan}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-ott-text-secondary">
                      Renewal Date
                    </p>
                    <p className="text-lg font-semibold text-ott-text-primary">
                      {new Date(
                        activeSubscription.currentPeriodEnd
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator className="bg-ott-border-soft/20" />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="ott-gradient-cta text-white hover:opacity-90">
                    Upgrade Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="border-ott-border-soft/30 text-ott-text-secondary hover:text-ott-text-primary"
                  >
                    Manage Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">No Active Subscription</CardTitle>
                <CardDescription>
                  Start your free trial or choose a plan below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="ott-gradient-cta text-white hover:opacity-90">
                  Browse Plans
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Available Plans */}
          <Card className="mb-6 border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Available Plans</CardTitle>
              <CardDescription>
                Choose the perfect plan for your viewing needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(PLANS).map(([key, plan]) => (
                  <div
                    key={key}
                    className="border border-ott-border-soft/30 rounded-lg p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 dark:hover:bg-white/10 ott-card-hover ott-glow-violet"
                  >
                    <h3 className="font-semibold text-ott-text-primary mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-2xl font-bold text-ott-accent mb-3">
                      ${plan.price}
                      <span className="text-xs font-normal text-ott-text-secondary">
                        /month
                      </span>
                    </p>
                    <ul className="space-y-2 mb-4">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-ott-text-secondary flex items-center gap-2"
                        >
                          <span className="text-ott-accent">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="outline"
                      className="w-full border-ott-border-soft/30 text-ott-text-secondary hover:text-ott-text-primary"
                    >
                      Select Plan
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="mb-6 border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="size-5 text-ott-accent" />
                Payment Method
              </CardTitle>
              <CardDescription>
                Manage your billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border border-ott-border-soft/30 rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-ott-accent/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="size-5 text-ott-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-ott-text-primary">
                      Visa ending in 4242
                    </p>
                    <p className="text-sm text-ott-text-secondary">
                      Expires 12/2026
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-ott-text-secondary hover:text-ott-text-primary"
                >
                  Edit
                </Button>
              </div>

              <Button
                variant="outline"
                className="w-full border-ott-border-soft/30 text-ott-text-secondary hover:text-ott-text-primary"
              >
                Add Payment Method
              </Button>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="border-ott-border-soft/30 bg-white/50 dark:bg-white/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Billing History</CardTitle>
              <CardDescription>
                Your recent invoices and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex justify-between items-center py-3 border-b border-ott-border-soft/20 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-ott-text-primary">
                          {payment.description}
                        </p>
                        <p className="text-sm text-ott-text-secondary">
                          {new Date(payment.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-semibold text-ott-text-primary">
                            ${payment.amount.toFixed(2)}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs mt-1 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-ott-accent hover:text-ott-accent"
                        >
                          <Download className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-ott-text-secondary mb-3">
                    No billing history yet
                  </p>
                  <Button className="ott-gradient-cta text-white hover:opacity-90">
                    Get Started
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
