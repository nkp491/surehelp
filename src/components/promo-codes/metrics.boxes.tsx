"use client"

import { Ticket, Download, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PROMO_CODE } from "./data-table"
export default function MetricsBoxes({promoCodes} : {promoCodes: PROMO_CODE[]}) {

  const activePromoCodes = promoCodes.filter(promo => promo.status === 'active').length;
  const totalRedemptions = promoCodes.reduce((total, promo) => total + promo.usage_count, 0);
  const totalExpiring = promoCodes.filter(promo => {
    const expirationDate = new Date(promo.expiration_date);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiration > 0 && daysUntilExpiration <= 7; // Expiring within 7 days
  }).length;
  const metrics = [
    {
      title: "Active Promo Codes",
      value: activePromoCodes,
      icon: Ticket,
      iconBg: "bg-blue-100",
      iconColor: "gray-400",
    },
    {
      title: "Total Redemptions",
      value: totalRedemptions,
      icon: Download,
      iconBg: "bg-blue-100",
      iconColor: "gray-400",
    },
    {
      title: "Expiring Soon",
      value: totalExpiring,
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

        return (
          <Card key={index} className="bg-gray-50 shadow-sm border border-gray-100">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-3">{metric.value}</p>
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
