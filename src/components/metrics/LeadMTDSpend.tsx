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
    <Card className="p-2 bg-gray-100 rounded-lg text-center shadow-sm">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-gray-500 mx-auto" />
      ) : (
        <>
          <div className="text-sm font-semibold text-red-600">
            {formatCurrency(mtdSpend || 0)}
          </div>
          <div className="text-xs text-muted-foreground">
            Lead MTD Spend
          </div>
        </>
      )}
    </Card>
  );
};

export default LeadMTDSpend;