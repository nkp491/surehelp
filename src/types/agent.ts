export interface Agent {
  id: string;
  name: string;
}
// 1. agent
// 1. agent_pro
// 2. manager_pro
// 3. manager_pro_gold
// 4. manager_pro_platinum
// 5. beta_user
// 5. system_admin
// 6. manager_tier

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

export const SubscriptionRoles = [
  AgentTypes.AGENT_PRO,
  AgentTypes.MANAGER_PRO,
  AgentTypes.MANAGER_PRO_GOLD,
  AgentTypes.MANAGER_PRO_PLATINUM
]