import { supabase } from '@/integrations/supabase/client';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { PromoCodesTable } from './data-table';
import MetricsBoxes from './metrics.boxes';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import LoadingScreen from '../ui/loading-screen';
import { PROMO_CODE } from './data-table';
function CouponsManager() {
  // Fetch promo codes from Supabase
  const [promoCodes, setPromoCodes] = useState<PROMO_CODE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromoCodes = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('promo_codes').select('*');

      if (error) {
        console.error('Error fetching promo codes:', error);
        setError(error.message);
        setPromoCodes([]);
      } else {
        setPromoCodes(data || []);
        setError(null);
      }

      setLoading(false);
    };

    fetchPromoCodes();
  }, []);

  return (
    <div className="space-y-6 py-6 sm:py-8 md:py-10">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#fbfaf8]">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Promo Code Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">View and manage all promo codes</p>
        </div>
      </div>
      <div className="space-y-6 sm:space-y-8">
        <Card className="w-full p-4 sm:p-6 shadow-sm bg-[#F1F1F1]">
          {loading ? (
            <LoadingScreen />
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <MetricsBoxes />
              <PromoCodesTable data={promoCodes} />
            </>
          )}
        </Card>
      </div>
    </div>
  )
}

export default CouponsManager
