
import { MetricCount } from "@/types/metrics";

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

export const calculateRatios = (metrics: MetricCount) => {
  const { leads, calls, contacts, scheduled, sits, sales, ap } = metrics;
  
  return [
    {
      label: "Lead to Contact",
      value: leads > 0 ? `${Math.round((contacts / leads) * 100)}%` : "0%",
    },
    {
      label: "Lead to Scheduled",
      value: leads > 0 ? `${Math.round((scheduled / leads) * 100)}%` : "0%",
    },
    {
      label: "Lead to Sits",
      value: leads > 0 ? `${Math.round((sits / leads) * 100)}%` : "0%",
    },
    {
      label: "Lead to Sales",
      value: leads > 0 ? `${Math.round((sales / leads) * 100)}%` : "0%",
    },
    {
      label: "Calls to Contact",
      value: calls > 0 ? `${Math.round((contacts / calls) * 100)}%` : "0%",
    },
    {
      label: "Calls to Scheduled",
      value: calls > 0 ? `${Math.round((scheduled / calls) * 100)}%` : "0%",
    },
    {
      label: "Calls to Sits",
      value: calls > 0 ? `${Math.round((sits / calls) * 100)}%` : "0%",
    },
    {
      label: "Calls to Sales",
      value: calls > 0 ? `${Math.round((sales / calls) * 100)}%` : "0%",
    },
    {
      label: "AP per Call",
      value: calls > 0 ? formatCurrency(ap / 100 / calls) : "$0",
    },
    {
      label: "Contact to Scheduled",
      value: contacts > 0 ? `${Math.round((scheduled / contacts) * 100)}%` : "0%",
    },
    {
      label: "Contact to Sits",
      value: contacts > 0 ? `${Math.round((sits / contacts) * 100)}%` : "0%",
    },
    {
      label: "Contact to Sales",
      value: contacts > 0 ? `${Math.round((sales / contacts) * 100)}%` : "0%",
    },
    {
      label: "AP per Contact",
      value: contacts > 0 ? formatCurrency(ap / 100 / contacts) : "$0",
    },
    {
      label: "AP per Lead",
      value: leads > 0 ? formatCurrency(ap / 100 / leads) : "$0",
    },
    {
      label: "Scheduled to Sits",
      value: scheduled > 0 ? `${Math.round((sits / scheduled) * 100)}%` : "0%",
    },
    {
      label: "Sits to Sales",
      value: sits > 0 ? `${Math.round((sales / sits) * 100)}%` : "0%",
    },
    {
      label: "AP per Sit",
      value: sits > 0 ? formatCurrency(ap / 100 / sits) : "$0",
    },
    {
      label: "AP per Sale",
      value: sales > 0 ? formatCurrency(ap / 100 / sales) : "$0",
    }
  ];
};
