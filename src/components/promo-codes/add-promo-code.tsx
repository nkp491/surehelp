"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CalendarIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { format, set } from "date-fns"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { PROMO_CODE } from "./data-table";
import { useToast } from "@/hooks/use-toast";

type FormData = {
  promoCode: string
  discountType: string
  discountValue?: number
  usageLimit: number
  expirationDate: Date
}

type AddPromoCodeProps = {
  onPromoCodeAdded?: (promo: PROMO_CODE) => void;
};

export function AddPromoCode({ onPromoCodeAdded }: AddPromoCodeProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
   const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      promoCode: "",
      discountType: "",
      discountValue: 0,
      usageLimit: 0,
      expirationDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
  })

  const discountType = watch("discountType")
  const showDiscountField = discountType === "percentage" || discountType === "fixed"

  const handleCreateCoupon = async (data: FormData) => {
    setIsLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error("No session found. Please log in and try again.")
      }

      const accessToken = session.access_token

      const response = await fetch("https://fkdvsxnwpbvahllneusg.supabase.co/functions/v1/create-promo-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          newCode: true,
          promo_code: data.promoCode,
          discount_type: data.discountType,
          value: data.discountValue,
          duration: "once",
          expiration_date: data.expirationDate.toISOString(),
          usage_limit: data.usageLimit,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Error response from function:", errorData)
        setIsLoading(false)
        toast({
        title: "Error",
        description: "Failed to create promo code: " + (errorData || "Unknown error"),
        variant: "destructive",
        duration: 5000,
      });
        throw new Error(errorData.error || `Error creating promo code`)
      }

      const result = await response.json()
      console.log("Response from function:", result)

      // Compose the new promo code object for optimistic update
      if (onPromoCodeAdded) {
        const newPromo: PROMO_CODE = {
          id: result.promo?.id,
          promo_code: result.promo?.promo_code,
          status: result.promo?.status,
          expiration_date: result.promo?.expiration_date,
          usage_limit: result.promo?.usage_limit,
          usage_count: result.promo?.usage_count || 0,
          coupon_id: result.promo?.coupon_id || '',
          promo_id: result.promo?.promo_id || '',
        };
        onPromoCodeAdded(newPromo);
      }
      setIsLoading(false)
      toast({
        title: "Success",
        description: "Promo code created successfully",
        variant: "default",
      });

      // Auto-close dialog after success
      setTimeout(() => {
        setOpen(false)
        reset()
      }, 2000)
    } catch (err) {
      console.error("Error calling Edge Function:", err)
      setIsLoading(false)
      // Show error alert
      toast({
        title: "Error",
        description: "Failed to create promo code: " + (err.error || err || "Unknown error"),
        variant: "destructive",
      });
    }
  }

  const onSubmit = async (data: FormData) => {
    await handleCreateCoupon(data)
  }

  const handleDialogClose = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen)
      if (!newOpen) {
        // Reset form and states when dialog closes
        reset()
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button>Create Promo Code</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create Promo Code</DialogTitle>
            <DialogDescription>Create promo codes from here</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Promo Code Text */}
            <div className="grid gap-2">
              <Label htmlFor="promoCode">Promo Code Text *</Label>
              <Input
                id="promoCode"
                {...register("promoCode", { required: "Promo code text is required" })}
                placeholder="Enter promo code"
                disabled={isLoading}
              />
              {errors.promoCode && <span className="text-sm text-red-500">{errors.promoCode.message}</span>}
            </div>

            {/* Discount Type */}
            <div className="grid gap-2">
              <Label htmlFor="discountType">Discount Type *</Label>
              <Controller
                name="discountType"
                control={control}
                rules={{ required: "Discount Type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Discount Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30-day-trial">30 Day Trial</SelectItem>
                      <SelectItem value="90-day-trial">90 Day Trial</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Discount</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.discountType && <span className="text-sm text-red-500">{errors.discountType.message}</span>}
            </div>

            {/* Conditional Discount Field */}
            {showDiscountField && (
              <div className="grid gap-2">
                <Label htmlFor="discountValue">
                  {discountType === "percentage" ? "Discount Percentage *" : "Discount Price *"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step={discountType === "percentage" ? "0.01" : "1"}
                  min="0"
                  max={discountType === "percentage" ? "100" : undefined}
                  {...register("discountValue", {
                    required: showDiscountField ? "Discount value is required" : false,
                    valueAsNumber: true,
                    min: { value: 0, message: "Value must be greater than 0" },
                    max:
                      discountType === "percentage"
                        ? { value: 100, message: "Percentage cannot exceed 100" }
                        : undefined,
                  })}
                  placeholder={discountType === "percentage" ? "Enter percentage (0-100)" : "Enter discount amount"}
                  disabled={isLoading}
                />
                {errors.discountValue && <span className="text-sm text-red-500">{errors.discountValue.message}</span>}
              </div>
            )}

            {/* Usage Limit */}
            <div className="grid gap-2">
              <Label htmlFor="usageLimit">Usage Limit *</Label>
              <Input
                id="usageLimit"
                type="number"
                {...register("usageLimit", {
                  required: "Usage limit is required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Usage limit must be at least 1" },
                })}
                placeholder="Enter usage limit"
                disabled={isLoading}
              />
              {errors.usageLimit && <span className="text-sm text-red-500">{errors.usageLimit.message}</span>}
            </div>

            {/* Expiration Date */}
            <div className="grid gap-2">
              <Label htmlFor="expirationDate">Expiration Date *</Label>
              <Controller
                name="expirationDate"
                control={control}
                rules={{ required: "Expiration date is required" }}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={isLoading}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date <= new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.expirationDate && <span className="text-sm text-red-500">{errors.expirationDate.message}</span>}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Promo Code"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
