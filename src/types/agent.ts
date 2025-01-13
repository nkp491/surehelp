export interface AgentMetrics {
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
  [key: string]: number;
}

export interface Agent {
  id: string;
  name: string;
}