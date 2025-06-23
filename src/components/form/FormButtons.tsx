"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Check, Clock, Loader2, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { formTranslations } from "@/utils/translations/form"

interface FormButtonsProps {
  onSubmit: (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => void
  loading?: boolean
  loadingButton?: string // 'protected' | 'follow-up' | 'declined'
}

const FormButtons = ({ onSubmit, loading = false, loadingButton }: FormButtonsProps) => {
  const { language } = useLanguage()
  const t = formTranslations[language]

  const getButtonContent = (buttonType: string, icon: React.ReactNode, label: string) => {
    const isLoading = loading && loadingButton === buttonType

    return (
      <>
        <div className={`transition-all duration-200 ${isLoading ? "scale-110" : ""}`}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : icon}
        </div>
        <span className={`font-medium transition-opacity duration-200 ${isLoading ? "opacity-75" : ""}`}>
          {isLoading ? "Processing..." : label}
        </span>
      </>
    )
  }

  return (
    <div className="mt-4">
      <div className="text-center mb-4 text-lg font-medium text-gray-700">{t.submitAs}</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-xl mx-auto">
        <Button
          onClick={(e) => onSubmit(e, "protected")}
          className={`
            bg-green-600 hover:bg-green-700 h-auto py-4 flex flex-col items-center gap-2
            transition-all duration-200 relative overflow-hidden
            ${loading && loadingButton === "protected" ? "bg-green-700 shadow-lg" : ""}
            ${loading && loadingButton !== "protected" ? "opacity-50" : ""}
          `}
          disabled={loading}
        >
          {loading && loadingButton === "protected" && (
            <div className="absolute inset-0 bg-green-800/20 animate-pulse" />
          )}
          <div className="relative z-10 flex flex-col items-center gap-2">
            {getButtonContent("protected", <Check className="h-6 w-6" />, t.protected)}
          </div>
        </Button>

        <Button
          onClick={(e) => onSubmit(e, "follow-up")}
          className={`
            bg-yellow-600 hover:bg-yellow-700 h-auto py-4 flex flex-col items-center gap-2
            transition-all duration-200 relative overflow-hidden
            ${loading && loadingButton === "follow-up" ? "bg-yellow-700 shadow-lg" : ""}
            ${loading && loadingButton !== "follow-up" ? "opacity-50" : ""}
          `}
          disabled={loading}
        >
          {loading && loadingButton === "follow-up" && (
            <div className="absolute inset-0 bg-yellow-800/20 animate-pulse" />
          )}
          <div className="relative z-10 flex flex-col items-center gap-2">
            {getButtonContent("follow-up", <Clock className="h-6 w-6" />, t.followUp)}
          </div>
        </Button>

        <Button
          onClick={(e) => onSubmit(e, "declined")}
          className={`
            bg-red-600 hover:bg-red-700 h-auto py-4 flex flex-col items-center gap-2
            transition-all duration-200 relative overflow-hidden
            ${loading && loadingButton === "declined" ? "bg-red-700 shadow-lg" : ""}
            ${loading && loadingButton !== "declined" ? "opacity-50" : ""}
          `}
          disabled={loading}
        >
          {loading && loadingButton === "declined" && <div className="absolute inset-0 bg-red-800/20 animate-pulse" />}
          <div className="relative z-10 flex flex-col items-center gap-2">
            {getButtonContent("declined", <X className="h-6 w-6" />, t.declined)}
          </div>
        </Button>
      </div>
    </div>
  )
}

export default FormButtons
