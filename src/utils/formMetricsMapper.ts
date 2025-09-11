import { FormSubmission } from "@/types/form";
import { MetricCount } from "@/types/metrics";

export const mapFormDataToMetrics = (
  formData: FormSubmission
): Partial<MetricCount> => {
  const metrics: Partial<MetricCount> = {};

  // Helper function to clean and parse currency values
  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, "");
    return parseFloat(cleanValue) || 0;
  };

  // Calculate AP (Annual Premium) from premium field
  if (formData.premium) {
    const monthlyPremium = parseCurrency(formData.premium);
    const annualPremium = monthlyPremium * 12;
    metrics.ap = Math.round(annualPremium * 100) / 100; // Round to 2 decimal places
  }

  // Based on outcome, increment appropriate metrics
  // This is a basic mapping - you can customize based on your business logic
  switch (formData.outcome?.toLowerCase()) {
    case "sale":
    case "sold":
    case "closed":
      metrics.sales = 1;
      metrics.sits = 1;
      metrics.scheduled = 1;
      metrics.contacts = 1;
      metrics.calls = 1;
      metrics.leads = 1;
      break;
    case "scheduled":
    case "appointment":
    case "sit":
      metrics.scheduled = 1;
      metrics.contacts = 1;
      metrics.calls = 1;
      metrics.leads = 1;
      break;
    case "contact":
    case "contacted":
    case "qualified":
      metrics.contacts = 1;
      metrics.calls = 1;
      metrics.leads = 1;
      break;
    case "call":
    case "called":
    case "dialed":
      metrics.calls = 1;
      metrics.leads = 1;
      break;
    case "lead":
    case "new lead":
    case "prospect":
      metrics.leads = 1;
      break;
    default:
      // Default behavior - increment leads for any submission
      metrics.leads = 1;
      break;
  }

  return metrics;
};

