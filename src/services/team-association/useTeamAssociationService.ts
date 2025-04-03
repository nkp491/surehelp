
import { useState } from 'react';
import { useTeamAssociationCore } from './core';
import { useSpecialTeamAssociations } from './special-cases';
import { useAgentTeamAssociation } from './agent-association';

export const useTeamAssociationService = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { checkAndUpdateTeamAssociation, addUserToManagerTeams } = useTeamAssociationCore(setIsProcessing);
  const { fixMomentumCapitolAssociation, checkMomentumTeams, checkMomentumManagerAssociations } = useSpecialTeamAssociations();
  const { forceAgentTeamAssociation } = useAgentTeamAssociation(setIsProcessing, checkAndUpdateTeamAssociation);

  return {
    checkAndUpdateTeamAssociation,
    fixMomentumCapitolAssociation,
    forceAgentTeamAssociation,
    addUserToManagerTeams,
    checkMomentumTeams,
    checkMomentumManagerAssociations,
    isProcessing
  };
};
