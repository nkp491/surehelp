import React, { createContext, useContext, useState } from 'react';
import { FormSubmission } from '@/types/form';

interface FamilyMember {
  id: string;
  data: Partial<FormSubmission>;
}

interface FamilyMembersContextType {
  familyMembers: FamilyMember[];
  addFamilyMember: () => void;
  removeFamilyMember: (id: string) => void;
  updateFamilyMember: (id: string, data: Partial<FormSubmission>) => void;
}

const FamilyMembersContext = createContext<FamilyMembersContextType | undefined>(undefined);

const initialMemberData = {
  selectedConditions: [],
  employmentStatus: [],
  selectedInvestments: [],
};

export function FamilyMembersProvider({ children }: { children: React.ReactNode }) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  const addFamilyMember = () => {
    if (familyMembers.length < 5) {
      setFamilyMembers([...familyMembers, { 
        id: crypto.randomUUID(),
        data: initialMemberData
      }]);
    }
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(member => member.id !== id));
  };

  const updateFamilyMember = (id: string, data: Partial<FormSubmission>) => {
    setFamilyMembers(familyMembers.map(member => 
      member.id === id ? { 
        ...member, 
        data: {
          ...initialMemberData,
          ...member.data,
          ...data
        }
      } : member
    ));
  };

  return (
    <FamilyMembersContext.Provider value={{ 
      familyMembers, 
      addFamilyMember, 
      removeFamilyMember, 
      updateFamilyMember 
    }}>
      {children}
    </FamilyMembersContext.Provider>
  );
}

export function useFamilyMembers() {
  const context = useContext(FamilyMembersContext);
  if (context === undefined) {
    throw new Error('useFamilyMembers must be used within a FamilyMembersProvider');
  }
  return context;
}