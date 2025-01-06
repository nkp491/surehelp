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
  const { leads, calls, contacts, scheduled, sits, sales } = metrics;
  
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
    }
  ];
};