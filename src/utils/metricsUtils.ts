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
  const { leads, contacts, scheduled, sits, sales, ap } = metrics;
  
  return [
    {
      label: "AP per Lead",
      value: leads > 0 ? formatCurrency(ap / leads) : "$0.00",
    },
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
  ];
};