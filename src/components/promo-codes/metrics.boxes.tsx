"use client"

import { Ticket, Download, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function MetricsBoxes() {
  const metrics = [
    {
      title: "Active Promo Codes",
      value: "200",
      trend: {
        percentage: "8.5%",
        direction: "up",
        text: "up from yesterday",
      },
      icon: Ticket,
      iconBg: "bg-blue-100",
      iconColor: "gray-400",
    },
    {
      title: "Total Redemptions",
      value: "178",
      trend: {
        percentage: "3.4%",
        direction: "down",
        text: "up from yesterday",
      },
      icon: Download,
      iconBg: "bg-blue-100",
      iconColor: "gray-400",
    },
    {
      title: "Expiring Soon",
      value: "5",
      trend: {
        percentage: "3.4%",
        direction: "up",
        text: "up from yesterday",
      },
      icon: Clock,
      iconBg: "bg-blue-100",
      iconColor: "gray-400",
    },
  ]

  return (
    <div className="bg-white p-5 mb-5 rounded-lg shadow-sm border border-gray-100">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.trend.direction === "up"

        return (
          <Card key={index} className="bg-gray-50 shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-3">{metric.value}</p>
                  <div className="flex items-center gap-1">
                    <svg
                      className={`w-4 h-4 ${isPositive ? "text-green-500" : "text-red-500"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      {isPositive ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                        />
                      )}
                    </svg>
                    <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                      {metric.trend.percentage}
                    </span>
                    <span className="text-sm text-gray-500">{metric.trend.text}</span>
                  </div>
                </div>
                <div className={`rounded-full p-3 ${metric.iconBg}`}>
                  <Icon className={`w-6 h-6 ${metric.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
    </div>
  )
}
