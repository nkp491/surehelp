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
      value: leads > 0 && contacts > 0 ? (leads / contacts).toFixed(1) : "0",
    },
    {
      label: "Leads to Scheduled",
      value: leads > 0 && scheduled > 0 ? (leads / scheduled).toFixed(1) : "0",
    },
    {
      label: "Leads to Sits",
      value: leads > 0 && sits > 0 ? (leads / sits).toFixed(1) : "0",
    },
    {
      label: "Leads to Sales",
      value: leads > 0 && sales > 0 ? (leads / sales).toFixed(1) : "0",
    },
    {
      label: "Calls to Contact",
      value: calls > 0 && contacts > 0 ? (calls / contacts).toFixed(1) : "0",
    },
    {
      label: "Calls to Scheduled",
      value: calls > 0 && scheduled > 0 ? (calls / scheduled).toFixed(1) : "0",
    },
    {
      label: "Calls to Sits",
      value: calls > 0 && sits > 0 ? (calls / sits).toFixed(1) : "0",
    },
    {
      label: "Calls to Sales",
      value: calls > 0 && sales > 0 ? (calls / sales).toFixed(1) : "0",
    },
    {
      label: "Contact to Scheduled",
      value: contacts > 0 && scheduled > 0 ? (contacts / scheduled).toFixed(1) : "0",
    },
    {
      label: "Contact to Sits",
      value: contacts > 0 && sits > 0 ? (contacts / sits).toFixed(1) : "0",
    },
    {
      label: "Contact to Sales",
      value: contacts > 0 && sales > 0 ? (contacts / sales).toFixed(1) : "0",
    },
    {
      label: "AP per Contact",
      value: contacts > 0 ? formatCurrency(ap / 100 / contacts) : "$0.00",
    },
    {
      label: "AP per Lead",
      value: leads > 0 ? formatCurrency(ap / 100 / leads) : "$0.00",
    },
    {
      label: "Scheduled to Sits",
      value: scheduled > 0 ? formatPercentage(sits / scheduled) : "0%",
    },
    {
      label: "Scheduled to Sales",
      value: scheduled > 0 ? formatPercentage(sales / scheduled) : "0%",
    },
    {
      label: "Sits to Sales (Close Ratio)",
      value: sits > 0 ? formatPercentage(sales / sits) : "0%",
    },
    {
      label: "AP per Sit",
      value: sits > 0 ? formatCurrency(ap / 100 / sits) : "$0.00",
    },
    {
      label: "AP per Appointment",
      value: scheduled > 0 ? formatCurrency(ap / 100 / scheduled) : "$0.00",
    },
    {
      label: "AP per Sale",
      value: sales > 0 ? formatCurrency(ap / 100 / sales) : "$0.00",
    }
  ];
};