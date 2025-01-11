import { useState } from "react";
import { Card } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { TrendingUp, TrendingDown, ChartBar, ChartLine, ChartPie } from "lucide-react";
import { useToast } from "./ui/use-toast";
import MetricCard from "./metrics/MetricCard";
import RatioCard from "./metrics/RatioCard";
import MetricsChart from "./MetricsChart";
import { calculateRatios } from "@/utils/metricsUtils";

interface AgentMetrics {
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
}

const mockAgents = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
  { id: "3", name: "Mike Johnson" },
];

const AgentPerformance = () => {
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<AgentMetrics>({
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0,
  });

  const handleAgentChange = (agentId: string) => {
    setSelectedAgent(agentId);
    // Mock data - in a real app, this would fetch from your backend
    const mockMetrics = {
      leads: Math.floor(Math.random() * 100),
      calls: Math.floor(Math.random() * 200),
      contacts: Math.floor(Math.random() * 50),
      scheduled: Math.floor(Math.random() * 30),
      sits: Math.floor(Math.random() * 20),
      sales: Math.floor(Math.random() * 10),
      ap: Math.floor(Math.random() * 10000),
    };
    setMetrics(mockMetrics);
    toast({
      title: "Agent Selected",
      description: `Viewing performance metrics for selected agent`,
    });
  };

  const ratios = calculateRatios(metrics);
  const chartData = Object.entries(metrics).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: key === 'ap' ? value / 100 : value,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Agent Performance Dashboard</h2>
          <Select value={selectedAgent} onValueChange={handleAgentChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select an agent" />
            </SelectTrigger>
            <SelectContent>
              {mockAgents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAgent && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {Object.entries(metrics).map(([metric, value]) => (
                <MetricCard
                  key={metric}
                  metric={metric}
                  value={value}
                  inputValue={metric === 'ap' ? (value / 100).toFixed(2) : value.toString()}
                  onInputChange={() => {}}
                  isCurrency={metric === 'ap'}
                  trend={10}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ratios.slice(0, 8).map((ratio, index) => (
                <RatioCard
                  key={index}
                  label={ratio.label}
                  value={ratio.value}
                />
              ))}
            </div>

            <MetricsChart 
              data={chartData}
              timePeriod="24h"
              onTimePeriodChange={() => {}}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default AgentPerformance;