import { AuditEntry } from "@/types/form";

export const useAuditTrail = () => {
  const createAuditEntry = (
    previousData: any,
    newData: any,
    action: 'created' | 'updated' | 'status_changed'
  ): AuditEntry => {
    const changedFields: string[] = [];
    const previousValues: { [key: string]: any } = {};
    const newValues: { [key: string]: any } = {};

    Object.keys(newData).forEach(key => {
      if (JSON.stringify(previousData[key]) !== JSON.stringify(newData[key])) {
        changedFields.push(key);
        previousValues[key] = previousData[key];
        newValues[key] = newData[key];
      }
    });

    return {
      timestamp: new Date().toISOString(),
      changedFields,
      previousValues,
      newValues,
      action
    };
  };

  return { createAuditEntry };
};