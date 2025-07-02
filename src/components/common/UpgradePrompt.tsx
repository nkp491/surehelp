
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UpgradePromptProps {
  title: string;
  description: string;
  requiredRole: string;
  onClose?: () => void;
}

export function UpgradePrompt({ 
  title, 
  description, 
  requiredRole,
  onClose 
}: UpgradePromptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const formatRoleName = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-amber-500" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>
          This feature requires additional permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
        <p className="mt-4 text-sm font-medium">
          Required role: <span className="font-semibold text-amber-600">{formatRoleName(requiredRole)}</span>
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClose}>
          Dismiss
        </Button>
        <Button variant="default" onClick={() => navigate('/pricing')}>
          Learn More
        </Button>
      </CardFooter>
    </Card>
  );
}
