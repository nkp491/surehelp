export interface Agent {
  id: string;
  name: string;
}

export const AgentTypes = {
  AGENT: 'agent',
  AGENT_PRO: 'agent_pro',
  MANAGER: 'manager',
  MANAGER_PRO: 'manager_pro',
  MANAGER_PRO_GOLD: 'manager_pro_gold',
  MANAGER_PRO_PLATINUM: 'manager_pro_platinum',
  BETA_USER: 'beta_user',
  SYSTEM_ADMIN: 'system_admin'
}