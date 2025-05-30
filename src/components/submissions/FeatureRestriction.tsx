import { UpgradePrompt } from "@/components/common/UpgradePrompt";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface FeatureRestrictionProps {
  feature: string;
  requiredRole: string;
  children: React.ReactNode;
  description: string;
}

export function FeatureRestriction({
  feature,
  requiredRole,
  children,
  description,
}: FeatureRestrictionProps) {
  const { hasRequiredRole } = useRoleCheck();
  const hasAccess = hasRequiredRole([requiredRole]);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <UpgradePrompt
      title={`Upgrade to Access ${feature}`}
      description={description}
      requiredRole={requiredRole}
    />
  );
}
