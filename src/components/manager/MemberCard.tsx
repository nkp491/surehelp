
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EnrichedMember } from "@/types/team";

interface MemberCardProps {
  data: EnrichedMember;
  timeRange: "weekly" | "monthly" | "ytd";
}

const MemberCard: React.FC<MemberCardProps> = ({ data, timeRange }) => {
  const { user_id, name, role, email, profile_image_url, metrics, notes } = data;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Format percentage
  const formatPercentage = (num: string | number) => {
    const value = typeof num === 'string' ? parseFloat(num) : num;
    return isNaN(value) ? '0%' : `${value.toFixed(1)}%`;
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile_image_url || undefined} alt={name} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">{name}</CardTitle>
              <p className="text-sm text-muted-foreground">{email || 'No email'}</p>
            </div>
          </div>
          <Badge variant="outline" className="capitalize">
            {role.replace(/_/g, " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Core Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(metrics.leads)}
              </div>
              <div className="text-xs text-muted-foreground">Leads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(metrics.calls)}
              </div>
              <div className="text-xs text-muted-foreground">Calls</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(metrics.contacts)}
              </div>
              <div className="text-xs text-muted-foreground">Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(metrics.sales)}
              </div>
              <div className="text-xs text-muted-foreground">Sales</div>
            </div>
          </div>

          {/* Key Ratios */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {formatPercentage(metrics.ratios.leadsToContact || 0)}
              </div>
              <div className="text-xs text-muted-foreground">Lead to Contact</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {formatPercentage(metrics.conversion)}
              </div>
              <div className="text-xs text-muted-foreground">Conversion Rate</div>
            </div>
          </div>

          {/* Notes count */}
          {notes && notes.length > 0 && (
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                {notes.length} meeting note{notes.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
