import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";

interface MetricInputProps {
  metric: string;
  currentValue: number;
  onInputChange: (value: string) => void;
  isAP?: boolean;
}

const MetricInput = ({
  metric,
  currentValue,
  onInputChange,
  isAP = false,
}: MetricInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);
  const previousLengthRef = useRef<number>(0);

  // Update input value when currentValue changes from outside
  useEffect(() => {
    if (!isFocused) {
      if (isAP) {
        // Store AP values as dollars, not cents
        setInputValue(String(currentValue));
      } else {
        setInputValue(currentValue.toString());
      }
    }
  }, [currentValue, isAP, isFocused]);

  // Restore cursor position after state update
  useEffect(() => {
    if (isFocused && inputRef.current && cursorPositionRef.current !== null) {
      // Calculate the new cursor position based on the length difference
      const lengthDiff = inputValue.length - previousLengthRef.current;
      const newPosition = cursorPositionRef.current + (lengthDiff > 0 ? 0 : lengthDiff);
      const finalPosition = Math.max(0, Math.min(newPosition, inputValue.length));
      
      inputRef.current.setSelectionRange(finalPosition, finalPosition);
      previousLengthRef.current = inputValue.length;
    }
  }, [inputValue, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cursorPosition = e.target.selectionStart || 0;
    const value = e.target.value;
    const prevValue = inputValue;
    
    if (isAP) {
      // For AP, allow one decimal point and up to 2 decimal places
      const parts = value.split('.');
      const hasDecimal = parts.length > 1;
      const decimalPart = hasDecimal ? parts[1] : '';
      
      if (
        parts.length <= 2 && // Only one decimal point
        decimalPart.length <= 2 && // Max 2 decimal places
        /^\d*\.?\d*$/.test(value) // Only numbers and one decimal
      ) {
        // Store the cursor position relative to the decimal point
        const prevDecimalIndex = prevValue.indexOf('.');
        const newDecimalIndex = value.indexOf('.');
        const isBeforeDecimal = cursorPosition <= (newDecimalIndex === -1 ? value.length : newDecimalIndex);
        
        setInputValue(value);
        previousLengthRef.current = prevValue.length;
        cursorPositionRef.current = cursorPosition;
        
        // Only update parent if we have a valid number
        const numericValue = parseFloat(value || '0');
        if (!isNaN(numericValue)) {
          // Store AP values as dollars, not cents
          onInputChange(numericValue.toString());
        }
      }
    } else {
      // For non-AP metrics, only allow integers
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      setInputValue(sanitizedValue);
      previousLengthRef.current = prevValue.length;
      cursorPositionRef.current = cursorPosition;
      
      const numericValue = parseInt(sanitizedValue || '0');
      if (!isNaN(numericValue)) {
        onInputChange(numericValue.toString());
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (isAP) {
      const value = String(currentValue);
      setInputValue(value);
      previousLengthRef.current = value.length;
      
      // Let the user start typing from the beginning
      if (inputRef.current) {
        inputRef.current.setSelectionRange(0, 0);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    cursorPositionRef.current = null;
    previousLengthRef.current = 0;
    
    if (isAP) {
      // Format the value properly on blur
      const numericValue = parseFloat(inputValue || '0');
      if (!isNaN(numericValue)) {
        // Store AP values as dollars, not cents
        onInputChange(numericValue.toString());
      } else {
        setInputValue('0');
        onInputChange('0');
      }
    } else {
      // For non-AP metrics, ensure the value is properly synced
      onInputChange(currentValue.toString());
      setInputValue(currentValue.toString());
    }
  };

  const displayValue = () => {
    if (!isAP) return inputValue;
    
    if (isFocused) {
      // When focused, show the raw input value
      return inputValue;
    } else {
      // When not focused, show the formatted currency
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(currentValue);
    }
  };

  return (
    <Input
      ref={inputRef}
      type="text"
      value={displayValue()}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`h-6 text-center px-1 text-sm bg-transparent ${
        isAP ? 'w-24' : 'w-16'
      }`}
      aria-label={`${metric} count`}
    />
  );
};

export default MetricInput;