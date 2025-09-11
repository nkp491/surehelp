import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";
import { useMetrics } from "@/contexts/MetricsContext";
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart,
} from "recharts";
import CustomTooltip from "./charts/CustomTooltip";
import { startOfDay, subDays, format } from "date-fns";
import { ChartSkeleton } from "./ui/loading-skeleton";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#64748B",
  "#2196F3",
  "#FFC107",
  "#FF5722",
  "#9C27B0",
  "#795548",
];

interface MetricsChartProps {
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
  isLoading?: boolean;
}

const MetricsChart = ({
  timePeriod,
  onTimePeriodChange,
  isLoading = false,
}: MetricsChartProps) => {
  const { sortedHistory, isLoading: historyLoading } = useMetricsHistory();
  const {
    timePeriod: contextTimePeriod,
    dateRange,
    handleTimePeriodChange,
    setDateRange,
  } = useMetrics();

  // Use context values if available, otherwise fall back to props
  const currentTimePeriod = contextTimePeriod || timePeriod;
  const currentDateRange = dateRange;

  // Filter data based on time period and date range
  const transformedMetricsData = useMemo(() => {
    if (!sortedHistory?.length) return [];

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (currentTimePeriod) {
      case "24h":
        startDate = subDays(now, 1);
        break;
      case "7d":
        startDate = subDays(now, 7);
        break;
      case "30d":
        startDate = subDays(now, 30);
        break;
      case "custom":
        if (currentDateRange?.from && currentDateRange?.to) {
          startDate = startOfDay(currentDateRange.from);
          endDate = startOfDay(currentDateRange.to);
        } else {
          startDate = subDays(now, 7); // fallback to 7 days
        }
        break;
      default:
        startDate = subDays(now, 7);
    }

    return sortedHistory
      .filter((entry) => {
        const entryDate = startOfDay(new Date(entry.date));
        return entryDate >= startDate && entryDate <= endDate;
      })
      .map((entry) => ({
        name: format(new Date(entry.date), "MMM dd"),
        fullDate: entry.date,
        leads: entry.metrics.leads || 0,
        calls: entry.metrics.calls || 0,
        contacts: entry.metrics.contacts || 0,
        scheduled: entry.metrics.scheduled || 0,
        sits: entry.metrics.sits || 0,
        sales: entry.metrics.sales || 0,
        ap: entry.metrics.ap || 0,
      }))
      .sort(
        (a, b) =>
          new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
      );
  }, [sortedHistory, currentTimePeriod, currentDateRange]);

  const metrics = [
    { key: "leads", label: "Leads", color: COLORS[0] },
    { key: "calls", label: "Calls", color: COLORS[1] },
    { key: "contacts", label: "Contacts", color: COLORS[2] },
    { key: "scheduled", label: "Scheduled", color: COLORS[3] },
    { key: "sits", label: "Sits", color: COLORS[4] },
    { key: "sales", label: "Sales", color: COLORS[5] },
  ];

  const maxAP = Math.max(...transformedMetricsData.map((item) => item.ap), 0);
  const yAxisDomain = [0, Math.ceil(maxAP / 10) * 10 || 10];

  if (isLoading || historyLoading) {
    return <ChartSkeleton />;
  }

  if (!transformedMetricsData || transformedMetricsData.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm text-[#2A6F97]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">KPI VISUALIZATION</h2>
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "px-6 py-2 rounded-lg font-medium transition-colors border",
                  currentTimePeriod === "custom"
                    ? "bg-[#3F7BA9] text-white border-[#3F7BA9]"
                    : "bg-white text-[#3F7BA9] border-[#3F7BA9] hover:bg-[#3F7BA9] hover:text-white"
                )}
              >
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, "MMM d")} -{" "}
                    {format(dateRange.to, "MMM d")}
                  </>
                ) : (
                  "Custom"
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                  // Set time period to custom when date range is selected
                  if (range?.from && range?.to) {
                    handleTimePeriodChange("custom");
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Chart Data Available
            </h3>
            <p className="text-gray-500">
              Add some metrics data to see visualizations here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm text-[#2A6F97]">
      <div className="flex items-center justify-between mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "px-6 py-2 rounded-lg font-medium transition-colors border",
                currentTimePeriod === "custom"
                  ? "bg-[#3F7BA9] text-white border-[#3F7BA9]"
                  : "bg-white text-[#3F7BA9] border-[#3F7BA9] hover:bg-[#3F7BA9] hover:text-white"
              )}
            >
              {dateRange.from && dateRange.to ? (
                <>
                  {format(dateRange.from, "MMM d")} -{" "}
                  {format(dateRange.to, "MMM d")}
                </>
              ) : (
                "Custom"
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                setDateRange({
                  from: range?.from,
                  to: range?.to,
                });
                // Set time period to custom when date range is selected
                if (range?.from && range?.to) {
                  handleTimePeriodChange("custom");
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={transformedMetricsData}
            margin={{ top: 20, right: 50, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" stroke="#2A6F97" />
            <YAxis yAxisId="metrics" orientation="left" stroke="#2A6F97" />
            <YAxis
              yAxisId="ap"
              orientation="right"
              domain={yAxisDomain}
              tickFormatter={(value) => `$${value}`}
              stroke="#22C55E"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {metrics.map(({ key, label, color }) => (
              <Bar
                key={key}
                yAxisId="metrics"
                dataKey={key}
                name={label}
                stackId="a"
                fill={color}
              />
            ))}
            <Line
              type="monotone"
              dataKey="ap"
              yAxisId="ap"
              name="AP"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ fill: "#22C55E", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsChart;
