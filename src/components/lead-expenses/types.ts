export interface LeadExpense {
  id: string;
  purchase_date: string;
  source: string;
  lead_type: string[];
  lead_count: number;
  total_cost: number;
}