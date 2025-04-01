
import { useState } from 'react';
import { useTeamAssociationCore } from './core';
import { useSpecialTeamAssociations } from './special-cases';
import { useAgentTeamAssociation } from './agent-association';

export const useTeamAssociationService = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { checkAndUpdateTeamAssociation } = useTeamAssociationCore(setIsProcessing);
  const { fixMomentumCapitolAssociation } = useSpecialTeamAssociations();
  const { forceAgentTeamAssociation } = useAgentTeamAssociation(setIsProcessing, checkAndUpdateTeamAssociation);

  return {
    checkAndUpdateTeamAssociation,
    fixMomentumCapitolAssociation,
    forceAgentTeamAssociation,
    isProcessing
  };
};
