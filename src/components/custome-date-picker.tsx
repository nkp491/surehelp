"use client"

import * as React from "react"
import { format, isValid, parse, getYear } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface DatePickerWithInputProps {
  /**
   * The current date value in "YYYY-MM-DD" format.
   */
  value?: string | Date
  /**
   * Callback function when the date changes. Returns date string in "YYYY-MM-DD" or undefined.
   */
  onChange: (dateString: string | undefined) => void
  /**
   * The earliest year selectable in the calendar and valid for input.
   * @default Current year - 100
   */
  startYear?: number
  /**
   * The latest year selectable in the calendar and valid for input.
   * @default Current year + 10
   */
  endYear?: number
  /**
   * The maximum selectable date in the calendar.
   */
  maxDate?: Date
  /**
   * Controls the open state of the popover. If not provided, component manages its own state.
   */
  open?: boolean // Made optional
  /**
   * Callback for when the open state of the popover changes. If not provided, component manages its own state.
   */
  onOpenChange?: (open: boolean) => void // Made optional
}

export function CustomeDatePicker({
  value,
  onChange,
  startYear = new Date().getFullYear() - 100,
  endYear = new Date().getFullYear() + 10,
  maxDate,
  open: controlledOpen, // Renamed to avoid conflict with internal state
  onOpenChange: controlledOnOpenChange, // Renamed to avoid conflict with internal state
}: DatePickerWithInputProps) {
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [inputValue, setInputValue] = React.useState<string>("")
  const [showInvalidTooltip, setShowInvalidTooltip] = React.useState(false)

  // Internal state for uncontrolled mode
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)

  // Determine which open state and setter to use
  const isControlled = controlledOpen !== undefined && controlledOnOpenChange !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setUncontrolledOpen

  // Effect to synchronize internal state with external `value` prop
  React.useEffect(() => {
    if (value) {
      let parsedFromProp: Date | undefined;
      if (typeof value === "string") {
        parsedFromProp = parse(value, "yyyy-MM-dd", new Date());
      } else if (value instanceof Date && isValid(value)) {
        parsedFromProp = value;
      } else {
        parsedFromProp = undefined;
      }
      if (parsedFromProp && isValid(parsedFromProp)) {
        setDate(parsedFromProp);
        setInputValue(format(parsedFromProp, "MM/dd/yyyy"));
        setShowInvalidTooltip(false); // Valid date from prop, hide tooltip
      } else {
        setDate(undefined);
        setInputValue("");
        setShowInvalidTooltip(true); // Invalid date from prop, show tooltip
      }
    } else {
      setDate(undefined);
      setInputValue("");
      setShowInvalidTooltip(false); // Empty value, hide tooltip
    }
  }, [value])

  // Handle changes in the input field for masked input and validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    let cleanedDigits = "" // Store only digits
    for (let i = 0; i < rawValue.length; i++) {
      const char = rawValue[i]
      if (/\d/.test(char)) {
        cleanedDigits += char
      }
    }

    let formattedOutput = ""
    let currentDigitIndex = 0

    // --- Month (MM) ---
    if (cleanedDigits.length > currentDigitIndex) {
      const firstMonthDigit = cleanedDigits.charAt(currentDigitIndex)
      if (firstMonthDigit === "0" || firstMonthDigit === "1") {
        formattedOutput += firstMonthDigit
        currentDigitIndex++
        if (cleanedDigits.length > currentDigitIndex) {
          const secondMonthDigit = cleanedDigits.charAt(currentDigitIndex)
          if (firstMonthDigit === "1" && Number.parseInt(secondMonthDigit) > 2) {
            formattedOutput += "2" // Cap at 12 (e.g., 13 -> 12)
          } else {
            formattedOutput += secondMonthDigit
          }
          currentDigitIndex++
        }
      } else if (Number.parseInt(firstMonthDigit) >= 2 && Number.parseInt(firstMonthDigit) <= 9) {
        formattedOutput += `0${firstMonthDigit}` // Prepend '0' for single digit month (e.g., 2 -> 02)
        currentDigitIndex++
      } else {
        // Invalid first digit for month (e.g., starts with non-digit or invalid digit)
        setInputValue("")
        setDate(undefined)
        onChange(undefined)
        setShowInvalidTooltip(true) // Show tooltip for invalid input
        return // Exit early
      }
    }

    // --- Day (DD) ---
    if (cleanedDigits.length > currentDigitIndex) {
      formattedOutput += "/"
      const firstDayDigit = cleanedDigits.charAt(currentDigitIndex)
      if (Number.parseInt(firstDayDigit) >= 0 && Number.parseInt(firstDayDigit) <= 3) {
        formattedOutput += firstDayDigit
        currentDigitIndex++
        if (cleanedDigits.length > currentDigitIndex) {
          const secondDayDigit = cleanedDigits.charAt(currentDigitIndex)
          if (firstDayDigit === "3" && Number.parseInt(secondDayDigit) > 1) {
            formattedOutput += "1" // Cap at 31 (e.g., 32 -> 31)
          } else {
            formattedOutput += secondDayDigit
          }
          currentDigitIndex++
        }
      } else {
        // Invalid first digit for day
        setInputValue(formattedOutput) // Keep what's valid so far
        setDate(undefined)
        onChange(undefined)
        setShowInvalidTooltip(true) // Show tooltip for invalid input
        return // Exit early
      }
    }

    // --- Year (YYYY) ---
    if (cleanedDigits.length > currentDigitIndex) {
      formattedOutput += "/"
      const yearPart = cleanedDigits.substring(currentDigitIndex, currentDigitIndex + 4)
      formattedOutput += yearPart
    }

    setInputValue(formattedOutput)

    // Now, parse the formatted string for actual date object and validation
    // date-fns's parse and isValid will handle actual date validity (e.g., Feb 30)
    const parsedDate = parse(formattedOutput, "MM/dd/yyyy", new Date())

    if (isValid(parsedDate)) {
      const parsedYear = getYear(parsedDate)
      if (parsedYear >= startYear && parsedYear <= endYear && (!maxDate || parsedDate <= maxDate)) {
        setDate(parsedDate)
        onChange(format(parsedDate, "yyyy-MM-dd")) // Update parent with YYYY-MM-DD
        setShowInvalidTooltip(false) // Valid date, hide tooltip
      } else {
        setDate(undefined)
        onChange(undefined)
        setShowInvalidTooltip(true) // Invalid year or future date, show tooltip
      }
    } else {
      setDate(undefined)
      onChange(undefined)
      setShowInvalidTooltip(formattedOutput.length > 0) // Show tooltip if input is not empty but invalid
    }
  }

  // Handle date selection from the calendar
  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      setInputValue(format(selectedDate, "MM/dd/yyyy"))
      onChange(format(selectedDate, "yyyy-MM-dd")) // Update parent with YYYY-MM-DD
      setShowInvalidTooltip(false) // Valid selection, hide tooltip
    } else {
      setInputValue("")
      onChange(undefined) // Clear parent value
      setShowInvalidTooltip(false) // Empty value, hide tooltip
    }
    setOpen(false) // Close popover after selection using the determined setter
  }

  return (
    <TooltipProvider>
      <Popover open={open} onOpenChange={setOpen}>
        {" "}
        {/* Use the determined open state and setter */}
        <Tooltip open={!open && showInvalidTooltip && inputValue.length > 0}>
          {" "}
          {/* Tooltip only shows when popover is closed and input is invalid/not empty */}
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-full justify-between text-left font-normal", !date && "text-muted-foreground")}
              >
                {date ? format(date, "PPP") : <span>MM/DD/YYYY</span>}
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent className="bg-red-500 text-white">
            <p>Invalid Date. Please use MM/DD/YYYY format.</p>
          </TooltipContent>
        </Tooltip>
        <PopoverContent className="w-auto p-0">
          <div className="p-4">
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="MM/DD/YYYY"
              maxLength={10} // MM/DD/YYYY is 10 characters
              className="mb-4"
              aria-label="Date input field"
            />
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
              fromYear={startYear} // Control calendar's start year
              toYear={endYear} // Control calendar's end year
              toDate={maxDate} // Control calendar's max date
            />
          </div>
        </PopoverContent>
      </Popover>
    </TooltipProvider>
  )
}
