import { useState } from "react";
import { Card } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { calculateRatios } from "@/utils/metricsUtils";
import AgentSelector from "./agent/AgentSelector";
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
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {Object.entries(metrics).map(([metric, value]) => (
                <Card key={metric} className="p-4">
                  <div className="flex flex-col items-center gap-2">
                    <h3 className="font-semibold text-lg capitalize">
                      {metric === 'ap' ? 'AP' : metric}
                    </h3>
                    <span className="text-xl font-bold">
                      {metric === 'ap' ? `$${(value / 100).toFixed(2)}` : value}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {ratios.slice(0, 8).map((ratio, index) => (
                <Card key={index} className="p-4">
                  <div className="flex flex-col items-center gap-2">
                    <h3 className="font-semibold text-lg text-center">{ratio.label}</h3>
                    <span className="text-xl font-bold">{ratio.value}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AgentPerformance;