import { useState } from "react";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { calculateRatios } from "@/utils/metricsUtils";
import AgentSelector from "./agent/AgentSelector";
import AgentMetricsDisplay from "./agent/AgentMetricsDisplay";
import { AgentMetrics } from "@/types/agent";

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
    value: value,
  }));

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Agent Performance Dashboard</h2>
          <AgentSelector
            agents={mockAgents}
            selectedAgent={selectedAgent}
            onAgentChange={handleAgentChange}
          />
        </div>

        {selectedAgent && (
          <AgentMetricsDisplay
            metrics={metrics}
            ratios={ratios}
            chartData={chartData}
          />
        )}
      </Card>
    </div>
  );
};

export default AgentPerformance;