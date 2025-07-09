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

type SubmissionState = {
  isLoading: boolean
  success: boolean
  error: string | null
}

export function AddPromoCode() {
  const [open, setOpen] = useState(false)
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isLoading: false,
    success: false,
    error: null,
  })

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

  const handleCreateCoupon = async (data: FormData) => {
    setSubmissionState({ isLoading: true, success: false, error: null })

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
          plan: data.planType,
          billing_cycle: data.billingCycle,
          expiration_date: data.expirationDate.toISOString(),
          usage_limit: data.usageLimit,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("Response from function:", result)

      setSubmissionState({ isLoading: false, success: true, error: null })

      // Auto-close dialog after success
      setTimeout(() => {
        setOpen(false)
        reset()
        setSubmissionState({ isLoading: false, success: false, error: null })
      }, 2000)
    } catch (err) {
      console.error("Error calling Edge Function:", err)
      setSubmissionState({
        isLoading: false,
        success: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred. Please try again.",
      })
    }
  }

  const onSubmit = async (data: FormData) => {
    await handleCreateCoupon(data)
  }

  const handleDialogClose = (newOpen: boolean) => {
    if (!submissionState.isLoading) {
      setOpen(newOpen)
      if (!newOpen) {
        // Reset form and states when dialog closes
        reset()
        setSubmissionState({ isLoading: false, success: false, error: null })
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

          {/* Success Message */}
          {submissionState.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Promo code created successfully! This dialog will close automatically.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {submissionState.error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{submissionState.error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            {/* Promo Code Text */}
            <div className="grid gap-2">
              <Label htmlFor="promoCode">Promo Code Text *</Label>
              <Input
                id="promoCode"
                {...register("promoCode", { required: "Promo code text is required" })}
                placeholder="Enter promo code"
                disabled={submissionState.isLoading}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={submissionState.isLoading}>
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
              <Label htmlFor="discountType">Discount Type *</Label>
              <Controller
                name="discountType"
                control={control}
                rules={{ required: "Discount Type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={submissionState.isLoading}>
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
                  disabled={submissionState.isLoading}
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
                  <Select onValueChange={field.onChange} value={field.value} disabled={submissionState.isLoading}>
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
                disabled={submissionState.isLoading}
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
                        disabled={submissionState.isLoading}
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
              <Button type="button" variant="outline" disabled={submissionState.isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submissionState.isLoading || submissionState.success}>
              {submissionState.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : submissionState.success ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Created!
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
