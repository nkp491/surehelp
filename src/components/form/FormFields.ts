import { FormField } from "@/types/formTypes";
import { PRIMARY_HEALTH_FIELDS } from "./fields/primaryHealthFields";
import { SPOUSE_HEALTH_FIELDS } from "./fields/spouseHealthFields";
import { PRIMARY_INCOME_FIELDS } from "./fields/primaryIncomeFields";
import { SPOUSE_INCOME_FIELDS } from "./fields/spouseIncomeFields";
import { HOUSEHOLD_INCOME_FIELDS } from "./fields/householdIncomeFields";
import { ASSESSMENT_NOTES_FIELDS } from "./fields/assessmentNotesFields";
import { AGENT_USE_ONLY_FIELDS } from "./fields/agentOnlyFields";

export const INITIAL_FIELDS = [
  { section: "Primary Health Assessment", fields: PRIMARY_HEALTH_FIELDS },
  { section: "Spouse Health Assessment", fields: SPOUSE_HEALTH_FIELDS },
  { section: "Primary Income Assessment", fields: PRIMARY_INCOME_FIELDS },
  { section: "Spouse Income Assessment", fields: SPOUSE_INCOME_FIELDS },
  { section: "Household Income", fields: HOUSEHOLD_INCOME_FIELDS },
  { section: "Assessment Notes", fields: ASSESSMENT_NOTES_FIELDS },
];