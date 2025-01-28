import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface DateInputProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const DateInput = ({ date, setDate }: DateInputProps) => {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputDate = e.target.value;
    if (inputDate) {
      const newDate = new Date(inputDate);
      if (!isNaN(newDate.getTime())) {
        setDate(newDate);
      }
    } else {
      setDate(undefined);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Purchase Date</label>
      <Input
        type="date"
        value={date ? format(date, 'yyyy-MM-dd') : ''}
        onChange={handleDateChange}
        max={format(new Date(), 'yyyy-MM-dd')}
      />
    </div>
  );
};

export default DateInput;