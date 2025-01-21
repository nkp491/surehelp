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

        console.log('[LeadMTDSpend] Fetching MTD spend for date range:', { startDate, endDate });

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

        console.log('[LeadMTDSpend] Retrieved expense data:', data);

        // Sum up the total costs - they are already in cents
        const totalInCents = data.reduce((sum, expense) => {
          console.log('[LeadMTDSpend] Processing expense:', {
            costInCents: expense.total_cost,
            runningTotal: sum + expense.total_cost
          });
          return sum + expense.total_cost;
        }, 0);

        console.log('[LeadMTDSpend] Final total in cents:', totalInCents);
        
        // Convert final total from cents to dollars when setting state
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
    // amount is in cents, so divide by 100 to get dollars
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  return (
    <Card className="p-6 bg-[#FFFCF6] hover:shadow-lg transition-all duration-200">
      <div className="flex flex-col items-center gap-3">
        <h3 className="font-semibold text-lg text-gray-700 text-center">Lead MTD Spend</h3>
        <span className="text-2xl font-bold text-primary">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            formatCurrency(mtdSpend || 0)
          )}
        </span>
      </div>
    </Card>
  );
};

export default LeadMTDSpend;