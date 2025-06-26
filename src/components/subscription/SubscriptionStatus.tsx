import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, CreditCard, Crown } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { format } from "date-fns";

export function SubscriptionStatus() {
  const {
    subscription,
    subscriptionPlan,
    isLoading,
    isSubscribed,
    isTrialing,
  } = useSubscription();
  const { createPortalSession, isLoading: isPortalLoading } =
    useStripeCheckout();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSubscribed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </CardTitle>
          <CardDescription>
            You're currently on the free Agent plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">Free Plan</Badge>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (isTrialing) {
      return (
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Trial Active
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-600">
        Active
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Subscription
        </CardTitle>
        <CardDescription>
          Manage your {subscriptionPlan?.name} subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{subscriptionPlan?.name}</p>
            <p className="text-sm text-muted-foreground">
              {subscriptionPlan?.description}
            </p>
          </div>
          {getStatusBadge()}
        </div>

        {subscription && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {isTrialing ? "Trial ends" : "Renews"} on{" "}
                {format(
                  new Date(
                    subscription.trial_end || subscription.current_period_end
                  ),
                  "MMM d, yyyy"
                )}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={createPortalSession}
          disabled={isPortalLoading}
          variant="outline"
          className="w-full"
        >
          {isPortalLoading ? "Loading..." : "Manage Billing"}
        </Button>
      </CardContent>
    </Card>
  );
}
