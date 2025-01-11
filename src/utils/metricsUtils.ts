export const calculateRatios = (metrics: { [key: string]: number }) => {
  const ratios = [
    {
      label: "Contact Rate",
      value: `${((metrics.contacts / metrics.calls) * 100).toFixed(1)}%`,
    },
    {
      label: "Appointment Rate",
      value: `${((metrics.scheduled / metrics.contacts) * 100).toFixed(1)}%`,
    },
    {
      label: "Show Rate",
      value: `${((metrics.sits / metrics.scheduled) * 100).toFixed(1)}%`,
    },
    {
      label: "Close Rate",
      value: `${((metrics.sales / metrics.sits) * 100).toFixed(1)}%`,
    },
    {
      label: "Conversion Rate",
      value: `${((metrics.sales / metrics.leads) * 100).toFixed(1)}%`,
    },
    {
      label: "Average Revenue",
      value: `$${(metrics.ap / metrics.sales || 0).toFixed(2)}`,
    }
  ];

  return ratios;
};