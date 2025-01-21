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
      const startDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
      const endDate = format(endOfToday(), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('lead_expenses')
        .select('total_cost')
        .gte('purchase_date', startDate)
        .lte('purchase_date', endDate);

      if (error) {
        console.error('Error fetching MTD spend:', error);
        return;
      }

      const total = data.reduce((sum, expense) => sum + expense.total_cost, 0);
      setMtdSpend(total);
      setIsLoading(false);
    };

    fetchMTDSpend();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100); // Assuming amount is stored in cents
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white">
      <div className="flex flex-col items-center gap-3">
        <h3 className="font-semibold text-lg text-white text-xl">Lead MTD Spend</h3>
        <div className="text-2xl font-bold text-white">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            formatCurrency(mtdSpend || 0)
          )}
        </div>
      </div>
    </Card>
  );
};

export default LeadMTDSpend;