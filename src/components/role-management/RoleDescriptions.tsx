import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RoleDescriptions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About Roles & Permissions</CardTitle>
        <CardDescription>
          Understanding the different roles and their capabilities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Agent */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-2">Agent</h3>
          <p className="text-muted-foreground mb-2">
            Basic role for all insurance agents.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Access to assessment forms</li>
            <li>Personal metrics tracking</li>
            <li>Client book of business</li>
          </ul>
        </div>

        {/* Agent Pro */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-2">Agent Pro</h3>
          <p className="text-muted-foreground mb-2">
            Enhanced role for professional agents.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Everything in Agent role</li>
            <li>Advanced lead tracking</li>
            <li>Commission calculator</li>
            <li>Performance analytics</li>
            <li>Priority support</li>
          </ul>
        </div>

        {/* Manager Pro */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-2">Manager Pro</h3>
          <p className="text-muted-foreground mb-2">
            Entry-level role for team managers and small agencies.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Everything in Agent Pro role</li>
            <li>Manager dashboard access</li>
            <li>Team performance analytics</li>
            <li>Up to 25 team members</li>
            <li>Team bulletin system</li>
            <li>One-on-one meeting scheduling</li>
            <li>Action item management</li>
            <li>Team lead expense tracking</li>
          </ul>
        </div>

        {/* Manager Pro Gold */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-2">Manager Pro Gold</h3>
          <p className="text-muted-foreground mb-2">
            Advanced role for medium agencies with multiple teams.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Everything in Manager Pro role</li>
            <li>Up to 500 team members</li>
            <li>Premium email support</li>
            <li>White-label reporting</li>
            <li>Advanced team analytics</li>
          </ul>
        </div>

        {/* Manager Pro Platinum */}
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-2">Manager Pro Platinum</h3>
          <p className="text-muted-foreground mb-2">
            Top-tier role for large teams and agencies.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Everything in Manager Pro Gold role</li>
            <li>Unlimited agent accounts</li>
            <li>Custom API integrations</li>
            <li>Dedicated account manager</li>
          </ul>
        </div>

        {/* Beta User */}
        <div>
          <h3 className="font-semibold text-lg mb-2">Beta User</h3>
          <p className="text-muted-foreground mb-2">
            Special role for testing new features.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Early access to new features</li>
            <li>Feedback opportunities</li>
            <li>Can be combined with other roles</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
