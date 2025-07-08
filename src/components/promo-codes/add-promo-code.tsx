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
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"

type FormData = {
  promoCode: string
  planType: string
  discountType: string
  discountValue?: number
  billingCycle: string
  usageLimit: number
  expirationDate: Date
}

export function AddPromoCode() {
  const [open, setOpen] = useState(false)

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
      planType: "",
      discountType: "",
      discountValue: 0,
      billingCycle: "monthly",
      usageLimit: 0,
      expirationDate: new Date(),
    },
  })

  const discountType = watch("discountType")
  const showDiscountField = discountType === "percentage" || discountType === "fixed-discount"

  const handleCreateCoupon = async (data: any) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.error("No session found. User is not authenticated.");
    return;
  }

  const accessToken = session.access_token;

  try {
    const response = await fetch("https://fkdvsxnwpbvahllneusg.supabase.co/functions/v1/create-promo-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    body: JSON.stringify({
    promo_code: data.promoCode,
    discount_type: data.discountType, // 30, 90 day trial, percentage, fixed discount
    value: data.discountValue,  // This should be dynamic based on the input
    duration: "once", // once or "repeating" or "forever"
    plan: data.planType,
    billing_cycle: data.billingCycle, // monthly or yearly
    expiration_date: data.expirationDate.toISOString(),
    usage_limit: data.usageLimit,
      })
    });

    const result = await response.json();
    console.log("Response from function:", result);
  } catch (err) {
    console.error("Error calling Edge Function:", err);
  }
 };

  const onSubmit = async (data: FormData) => {
    await handleCreateCoupon(data)
    console.log("Form Data:", data)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              />
              {errors.promoCode && <span className="text-sm text-red-500">{errors.promoCode.message}</span>}
            </div>

            {/* Plan Type */}
            <div className="grid gap-2">
              <Label htmlFor="planType">Type of Plan *</Label>
              <Controller
                name="planType"
                control={control}
                rules={{ required: "Plan type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agent_pro">Agent Pro</SelectItem>
                      <SelectItem value="manager_pro">Manager Pro</SelectItem>
                      <SelectItem value="manager_pro_gold">Manager Pro Gold</SelectItem>
                      <SelectItem value="manager_pro_platinum">Manager Pro Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.planType && <span className="text-sm text-red-500">{errors.planType.message}</span>}
            </div>

            {/* Discount Type */}
            <div className="grid gap-2">
              <Label htmlFor="discountType">Discount Type Type *</Label>
              <Controller
                name="discountType"
                control={control}
                rules={{ required: "Discount Type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Discount Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30-day-trial">30 Day Trial</SelectItem>
                      <SelectItem value="90-day-trial">90 Day Trial</SelectItem>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed-discount">Fixed Discount</SelectItem>
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
                />
                {errors.discountValue && <span className="text-sm text-red-500">{errors.discountValue.message}</span>}
              </div>
            )}

            {/* Billing Cycle */}
            <div className="grid gap-2">
              <Label htmlFor="billingCycle">Billing Cycle *</Label>
              <Controller
                name="billingCycle"
                control={control}
                rules={{ required: "Billing cycle is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.billingCycle && <span className="text-sm text-red-500">{errors.billingCycle.message}</span>}
            </div>

            {/* usage limit */}
            <div className="grid gap-2">
              <Label htmlFor="usageLimit">Usage Limit *</Label>
              <Input
                id="usageLimit"
                type="number"
                {...register("usageLimit", 
                 { required: "Usage limit is required",
                    valueAsNumber: true,
                    min: { value: 1, message: "Usage limit must be at least 1" },
                  })}
                placeholder="Enter usage limit"
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
                        disabled={(date) => date < new Date()}
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
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Create Promo Code</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
