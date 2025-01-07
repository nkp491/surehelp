export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercentage = (value: number) => {
  return `${(value * 100).toFixed(1)}%`;
};

export const calculateRatios = (metrics: { [key: string]: number }) => {
  const { leads, calls, contacts, scheduled, sits, sales, ap } = metrics;
  
  return [
    {
      label: "Leads to Contact",
      value: leads > 0 ? formatPercentage(contacts / leads) : "0%",
    },
    {
      label: "Leads to Scheduled",
      value: leads > 0 ? formatPercentage(scheduled / leads) : "0%",
    },
    {
      label: "Leads to Sits",
      value: leads > 0 ? formatPercentage(sits / leads) : "0%",
    },
    {
      label: "Leads to Sales",
      value: leads > 0 ? formatPercentage(sales / leads) : "0%",
    },
    {
      label: "Calls to Contact",
      value: calls > 0 ? formatPercentage(contacts / calls) : "0%",
    },
    {
      label: "Calls to Scheduled",
      value: calls > 0 ? formatPercentage(scheduled / calls) : "0%",
    },
    {
      label: "Calls to Sits",
      value: calls > 0 ? formatPercentage(sits / calls) : "0%",
    },
    {
      label: "Calls to Sales",
      value: calls > 0 ? formatPercentage(sales / calls) : "0%",
    },
    {
      label: "Contact to Scheduled",
      value: contacts > 0 ? formatPercentage(scheduled / contacts) : "0%",
    },
    {
      label: "Contact to Sits",
      value: contacts > 0 ? formatPercentage(sits / contacts) : "0%",
    },
    {
      label: "Contact to Sales",
      value: contacts > 0 ? formatPercentage(sales / contacts) : "0%",
    },
    {
      label: "AP per Contact",
      value: contacts > 0 ? formatCurrency(ap / 100 / contacts) : "$0.00",
    },
    // New ratios
    {
      label: "Scheduled to Sits",
      value: scheduled > 0 ? formatPercentage(sits / scheduled) : "0%",
    },
    {
      label: "Scheduled to Sales",
      value: scheduled > 0 ? formatPercentage(sales / scheduled) : "0%",
    },
    {
      label: "AP per Sit",
      value: sits > 0 ? formatCurrency(ap / 100 / sits) : "$0.00",
    },
    {
      label: "AP per Appointment",
      value: scheduled > 0 ? formatCurrency(ap / 100 / scheduled) : "$0.00",
    }
  ];
};