import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  outcome: string | undefined;
}

const StatusBadge = ({ outcome }: StatusBadgeProps) => {
  const getSubmissionStatus = (outcome: string | undefined) => {
    switch (outcome?.toLowerCase()) {
      case "protected":
        return "bg-green-500";
      case "follow-up":
        return "bg-yellow-500";
      case "declined":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Badge className={`${getSubmissionStatus(outcome)} text-white`}>
      {outcome || "Pending"}
    </Badge>
  );
};

export default StatusBadge;