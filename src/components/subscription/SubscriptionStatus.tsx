import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, CreditCard, Crown, Zap } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export function SubscriptionStatus() {
  const {
    subscription,
    subscriptionPlan,
    isLoading,
    isSubscribed,
    isTrialing,
  } = useSubscription();
  const navigate = useNavigate();
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
        <CardContent className="relative space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">
              Free Plan
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Zap className="w-3 h-3" />
              Limited features
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Upgrade to unlock premium features and remove limitations</div>
        </CardContent>

        <CardFooter className="relative pt-4">
          <Button asChild className="w-full group">
            <Button onClick={() => navigate('/pricing')}>
              Upgrade to Pro
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (isTrialing) {
      return (
        <Badge
          variant="secondary"
          className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 font-medium"
        >
          <Clock className="w-3 h-3 mr-1" />
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
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-lg">{subscriptionPlan?.name}</p>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{subscriptionPlan?.description}</p>
            </div>
          </div>
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
          className="w-full"
        >
          {isPortalLoading ? "Loading..." : "Manage Billing"}
        </Button>
      </CardContent>
    </Card>
  );
}
