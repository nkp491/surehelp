import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Agent {
  id: string;
  name: string;
}

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: string;
  onAgentChange: (agentId: string) => void;
}

const AgentSelector = ({ agents, selectedAgent, onAgentChange }: AgentSelectorProps) => {
  return (
    <Select value={selectedAgent} onValueChange={onAgentChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select an agent" />
      </SelectTrigger>
      <SelectContent>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            {agent.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AgentSelector;