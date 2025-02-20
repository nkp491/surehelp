import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfToday, format } from "date-fns";
import { Loader2 } from "lucide-react";

const LeadMTDSpend = () => {
  const [mtdSpend, setMtdSpend] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMTDSpend = async () => {
      try {
        const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        const endDate = format(endOfToday(), 'yyyy-MM-dd');

        const { data, error } = await supabase
          .from('lead_expenses')
          .select('total_cost')
          .gte('purchase_date', startDate)
          .lte('purchase_date', endDate);

        if (error) {
          console.error('[LeadMTDSpend] Error fetching MTD spend:', error);
          setIsLoading(false);
          return;
        }

        // Sum up the total costs (stored in cents)
        const totalInCents = data.reduce((sum, expense) => {
          return sum + expense.total_cost;
        }, 0);
        
        // Store the total in cents
        setMtdSpend(totalInCents);
        setIsLoading(false);
      } catch (error) {
        console.error('[LeadMTDSpend] Error in fetchMTDSpend:', error);
        setIsLoading(false);
      }
    };

    fetchMTDSpend();
  }, []);

  const formatCurrency = (amount: number) => {
    // Convert cents to dollars for display
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-[#3F7BA9] p-2 text-white">
        <h3 className="font-medium text-sm text-center">Lead MTD Spend</h3>
      </div>
      <div className="bg-[#F5F5F5] p-4 flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-[#3F7BA9]" />
        ) : (
          <span className="text-2xl font-bold text-[#2A2A2A]">
            {formatCurrency(mtdSpend || 0)}
          </span>
        )}
      </div>
    </Card>
  );
};

export default LeadMTDSpend;