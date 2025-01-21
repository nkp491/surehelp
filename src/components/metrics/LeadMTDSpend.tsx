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

        console.log('Fetching MTD spend for date range:', { startDate, endDate });

        const { data, error } = await supabase
          .from('lead_expenses')
          .select('total_cost')
          .gte('purchase_date', startDate)
          .lte('purchase_date', endDate);

        if (error) {
          console.error('Error fetching MTD spend:', error);
          setIsLoading(false);
          return;
        }

        console.log('Retrieved expense data:', data);

        // Sum up the total costs, keeping in mind they're stored in cents
        const total = data.reduce((sum, expense) => {
          console.log('Processing expense:', {
            cost: expense.total_cost,
            runningTotal: sum + expense.total_cost
          });
          // The total_cost is already in cents, so we don't need to divide it again
          return sum + expense.total_cost;
        }, 0);

        console.log('Final calculated total:', total);
        // Convert the final total from cents to dollars when setting the state
        setMtdSpend(total / 100);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in fetchMTDSpend:', error);
        setIsLoading(false);
      }
    };

    fetchMTDSpend();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
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
