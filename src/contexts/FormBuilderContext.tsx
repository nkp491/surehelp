import React, { createContext, useContext, useState } from 'react';

interface FormBuilderContextType {
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  selectedField: string | null;
  setSelectedField: (fieldId: string | null) => void;
}

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export function FormBuilderProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);

  return (
    <FormBuilderContext.Provider 
      value={{ 
        isEditMode, 
        setIsEditMode,
        selectedField,
        setSelectedField
      }}
    >
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
}