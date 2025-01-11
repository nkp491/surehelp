import React, { createContext, useContext, useState } from 'react';

interface SpouseVisibilityContextType {
  showSpouse: boolean;
  setShowSpouse: (value: boolean) => void;
  toggleSpouse: () => void;
}

const SpouseVisibilityContext = createContext<SpouseVisibilityContextType | undefined>(undefined);

export function SpouseVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [showSpouse, setShowSpouse] = useState(false);

  const toggleSpouse = () => {
    setShowSpouse(!showSpouse);
  };

  return (
    <SpouseVisibilityContext.Provider value={{ showSpouse, setShowSpouse, toggleSpouse }}>
      {children}
    </SpouseVisibilityContext.Provider>
  );
}

export function useSpouseVisibility() {
  const context = useContext(SpouseVisibilityContext);
  if (context === undefined) {
    throw new Error('useSpouseVisibility must be used within a SpouseVisibilityProvider');
  }
  return context;
}