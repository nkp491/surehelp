import {
  Phone,
  Calendar,
  MessageSquare,
  Target,
  TrendingUp,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Type definitions
interface Note {
  id: string | number;
  content: string;
  created_at: string;
}

interface Ratios {
  leadsToContact: string;
  leadsToScheduled: string;
  leadsToSits: string;
  leadsToSales: string;
  aPPerLead: string;
  contactToScheduled: string;
  contactToSits: string;
  callsToContact: string;
  callsToScheduled: string;
  callsToSits: string;
  callsToSales: string;
  aPPerCall: string;
  contactToSales: string;
  aPPerContact: string;
  scheduledToSits: string;
  sitsToSalesCloseRatio: string;
  aPPerSit: string;
  aPPerSale: string;
}

interface Metrics {
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
  conversion: number;
  ratios: Ratios;
}

interface MemberData {
  name: string;
  role: string;
  profile_image_url?: string;
  metrics: Metrics;
  notes: Note[];
}

type TimeRange = "weekly" | "monthly" | "ytd";

interface MemberCardProps {
  data: MemberData;
  timeRange: TimeRange;
}

const getTimeRangeLabel = (range: TimeRange): string => {
  switch (range) {
    case "weekly":
      return "Weekly";
    case "monthly":
      return "Monthly";
    case "ytd":
    default:
      return "Year to Date";
  }
};

const PRIMARY_METRICS = [
  { key: "leads", label: "Leads", colorClass: "text-blue-600" },
  { key: "calls", label: "Calls", colorClass: "text-blue-600" },
  { key: "contacts", label: "Contacts", colorClass: "text-blue-600" },
  { key: "scheduled", label: "Scheduled", colorClass: "text-blue-600" },
  { key: "sits", label: "Sits", colorClass: "text-blue-600" },
  { key: "sales", label: "Sales", colorClass: "text-blue-600" },
] as const;

const RATIO_METRICS = [
  { key: "leadsToContact", label: "Lead to Contact", format: "percent" },
  { key: "leadsToScheduled", label: "Lead to Scheduled", format: "percent" },
  { key: "leadsToSits", label: "Lead to Sits", format: "percent" },
  { key: "leadsToSales", label: "Lead to Sales", format: "percent" },
  { key: "aPPerLead", label: "AP per Lead", format: "currency" },
  {
    key: "contactToScheduled",
    label: "Contact to Scheduled",
    format: "percent",
  },
  { key: "contactToSits", label: "Contact to Sits", format: "percent" },
  { key: "callsToContact", label: "Calls to Contact", format: "percent" },
  { key: "callsToScheduled", label: "Calls to Scheduled", format: "percent" },
  { key: "callsToSits", label: "Calls to Sits", format: "percent" },
  { key: "callsToSales", label: "Calls to Sales", format: "percent" },
  { key: "aPPerCall", label: "AP per Call", format: "currency" },
  { key: "contactToSales", label: "Contact to Sales", format: "percent" },
  { key: "aPPerContact", label: "AP per Contact", format: "currency" },
  { key: "scheduledToSits", label: "Scheduled to Sits", format: "percent" },
  { key: "sitsToSalesCloseRatio", label: "Sits to Sales", format: "percent" },
  { key: "aPPerSit", label: "AP per Sit", format: "currency" },
  { key: "aPPerSale", label: "AP per Sale", format: "currency" },
] as const;

const formatValue = (
  value: number | string,
  format: "percent" | "currency"
): string => {
  if (format === "percent") {
    // If the value already contains a percentage sign, return it as is
    if (typeof value === "string" && value.includes("%")) {
      return value;
    }
    return `${value}%`;
  }
  // If the value already contains a dollar sign, return it as is
  if (typeof value === "string" && value.includes("$")) {
    return value;
  }
  return `$${value}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const calculateSuccessScore = (conversion: number): number => {
  return Math.round((conversion / 100) * 100);
};

const MemberCard: React.FC<MemberCardProps> = ({ data, timeRange }) => {
  const timeRangeLabel = getTimeRangeLabel(timeRange);
  const successScore = calculateSuccessScore(data.metrics.conversion);

  const formatRoleName = (role: string): string => {
    if (!role) return "";

    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative cursor-pointer transition-all">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {data.profile_image_url ? (
            <img
              src={data.profile_image_url}
              alt={`${data.name} profile`}
              className="size-10 rounded-full object-cover"
            />
          ) : (
            <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
              {data.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold">{data.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatRoleName(data.role)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm font-medium text-green-600">
            {data.metrics.conversion}% Conversion
          </div>
          <Progress value={data.metrics.conversion} className="w-24 h-2" />
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        {PRIMARY_METRICS.map(({ key, label, colorClass }) => (
          <div key={key} className="bg-blue-50 p-3 rounded-lg text-center">
            <div className={`text-lg font-bold ${colorClass}`}>
              {
                data.metrics[
                  key as keyof Omit<Metrics, "ratios" | "conversion">
                ]
              }
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
        <div className="bg-green-50 p-3 rounded-lg text-center col-span-2">
          <div className="text-lg font-bold text-green-600">
            ${data.metrics.ap}
          </div>
          <div className="text-xs text-muted-foreground">AP</div>
        </div>
      </div>

      {/* Ratio Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {RATIO_METRICS.map(({ key, label, format }) => (
          <div key={key} className="bg-gray-100 p-2 rounded text-center">
            <div className="text-sm font-semibold">
              {formatValue(data.metrics.ratios[key as keyof Ratios], format)}
            </div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Success Calculator and 1:1 Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        {/* Success Calculator Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">SUCCESS CALCULATOR</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium">Conversion Rate</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {data.metrics.conversion}%
              </div>
              <p className="text-xs text-muted-foreground">
                {timeRangeLabel} Rate
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium">Success Score</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {successScore}
              </div>
              <p className="text-xs text-muted-foreground">
                {timeRangeLabel} Rating
              </p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Individual Progress</span>
              <span>{data.metrics.conversion}%</span>
            </div>
            <Progress value={data.metrics.conversion} className="h-1.5" />
          </div>
        </div>

        {/* 1:1 Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">1:1 NOTES</h3>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {data.notes.length > 0 ? (
              data.notes.map((note) => (
                <div key={note.id} className="p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {formatDate(note.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{note.content}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No 1:1 notes available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
