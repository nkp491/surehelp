import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MetricCount } from '@/types/metrics';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit2, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const MetricsHistory = () => {
  const [history, setHistory] = useState<Array<{ date: string; metrics: MetricCount }>>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<MetricCount | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedHistory = data.map(entry => ({
        date: entry.date,
        metrics: {
          leads: entry.leads || 0,
          calls: entry.calls || 0,
          contacts: entry.contacts || 0,
          scheduled: entry.scheduled || 0,
          sits: entry.sits || 0,
          sales: entry.sales || 0,
          ap: entry.ap || 0,
        }
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading metrics history:', error);
      toast({
        title: "Error",
        description: "Failed to load metrics history",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (date: string, metrics: MetricCount) => {
    setEditingRow(date);
    setEditedValues(metrics);
  };

  const handleSave = async (date: string) => {
    if (!editedValues) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('daily_metrics')
        .update(editedValues)
        .eq('date', date)
        .eq('user_id', user.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metrics updated successfully",
      });

      setEditingRow(null);
      setEditedValues(null);
      loadHistory();
    } catch (error) {
      console.error('Error updating metrics:', error);
      toast({
        title: "Error",
        description: "Failed to update metrics",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedValues(null);
  };

  const handleValueChange = (metric: keyof MetricCount, value: string) => {
    if (!editedValues) return;

    let numericValue = parseInt(value) || 0;
    if (metric === 'ap') {
      // Convert dollar input to cents
      numericValue = Math.round(parseFloat(value) * 100) || 0;
    }

    setEditedValues({
      ...editedValues,
      [metric]: numericValue
    });
  };

  const formatValue = (value: number, metric: keyof MetricCount) => {
    if (metric === 'ap') {
      return (value / 100).toFixed(2);
    }
    return value.toString();
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Calls</TableHead>
            <TableHead>Contacts</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Sits</TableHead>
            <TableHead>Sales</TableHead>
            <TableHead>AP</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map(({ date, metrics }) => (
            <TableRow key={date}>
              <TableCell>{format(new Date(date), 'MMM dd, yyyy')}</TableCell>
              {Object.entries(metrics).map(([metric, value]) => (
                <TableCell key={metric}>
                  {editingRow === date ? (
                    <Input
                      type="text"
                      value={formatValue(editedValues?.[metric as keyof MetricCount] || 0, metric as keyof MetricCount)}
                      onChange={(e) => handleValueChange(metric as keyof MetricCount, e.target.value)}
                      className="w-24"
                    />
                  ) : (
                    formatValue(value, metric as keyof MetricCount)
                  )}
                </TableCell>
              ))}
              <TableCell>
                {editingRow === date ? (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSave(date)}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCancel}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(date, metrics)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MetricsHistory;