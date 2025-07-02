import { AlertCircle, Crown, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RoleAssignCard({role}: { role: string }) {
    const [isVisible, setIsVisible] = useState(true);
    const handleClose = () => setIsVisible(false);
  const formatRoleName = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const navigate = useNavigate();
  return (
    <>
    {isVisible && (
    <Card className="w-full shadow-md my-10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <CardTitle>Role Assignment Pending</CardTitle>
        </div>
        <CardDescription>
          You have a new role assignment that requires subscription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium">Assigned Role:</span>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {formatRoleName(role)}
          </Badge>
        </div>
        <div className="rounded-md bg-white p-3 border border-amber-200">
          <p className="text-sm">
            <strong>Admin has assigned the following role to you:</strong> {formatRoleName(role)}
          </p>
          <p className="text-sm mt-2">
            However, you have not subscribed yet. Please subscribe to activate your new role and access premium
            features.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2 pt-4">
        <Button variant="default" onClick={() => navigate('/pricing')}>
          <CreditCard className="mr-2 h-4 w-4" />
          Subscribe Now
        </Button>
        <Button variant="outline"
        onClick={handleClose}
        className="border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent">
          Dismiss
        </Button>
      </CardFooter>
    </Card>)
    }
    </>
  )
}
