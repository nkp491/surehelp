import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ChartControlsProps {
  timePeriod: '24h' | '7d' | '30d' | 'custom';
  chartType: 'bar' | 'line' | 'pie';
  onTimePeriodChange: (period: '24h' | '7d' | '30d' | 'custom') => void;
  onChartTypeChange: (type: 'bar' | 'line' | 'pie') => void;
}

const ChartControls = ({
  timePeriod,
  chartType,
  onTimePeriodChange,
  onChartTypeChange,
}: ChartControlsProps) => {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center mb-6">
      <h2 className="text-2xl font-bold">Metrics Visualization</h2>
      <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
        <RadioGroup
          value={timePeriod}
          onValueChange={(value) => onTimePeriodChange(value as '24h' | '7d' | '30d' | 'custom')}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="24h" id="24h" />
            <Label htmlFor="24h">24 Hours</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="7d" id="7d" />
            <Label htmlFor="7d">7 Days</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="30d" id="30d" />
            <Label htmlFor="30d">30 Days</Label>
          </div>
        </RadioGroup>
        <div className="space-x-2">
          <Button
            variant={chartType === 'bar' ? 'default' : 'outline'}
            onClick={() => onChartTypeChange('bar')}
          >
            Bar Chart
          </Button>
          <Button
            variant={chartType === 'line' ? 'default' : 'outline'}
            onClick={() => onChartTypeChange('line')}
          >
            Line Chart
          </Button>
          <Button
            variant={chartType === 'pie' ? 'default' : 'outline'}
            onClick={() => onChartTypeChange('pie')}
          >
            Pie Chart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChartControls;