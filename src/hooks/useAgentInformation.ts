
import { useState, useEffect } from "react";

export type AgentInfoData = {
  direct_line?: string | null;
  email?: string | null;
  resident_location?: string | null;
  years_of_service_date?: Date | string | null;
  line_authority?: string[] | null;
  active_state_licenses?: string[] | null;
  national_producer_number?: string | null;
  resident_license_number?: string | null;
  doj_background_check_date?: Date | string | null;
  live_scan_date?: Date | string | null;
  continuing_education_date?: Date | string | null;
  resident_license_status_date?: Date | string | null;
  resident_license_renewal_date?: Date | string | null;
};

export const useAgentInformation = (
  agentInfo: AgentInfoData | null | undefined,
  onUpdate: (data: any) => void
) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AgentInfoData>({
    direct_line: "",
    email: "",
    resident_location: "",
    years_of_service_date: null,
    line_authority: [],
    active_state_licenses: [],
    national_producer_number: "",
    resident_license_number: "",
    doj_background_check_date: null,
    live_scan_date: null,
    continuing_education_date: null,
    resident_license_status_date: null,
    resident_license_renewal_date: null,
  });

  // Update form data when props change
  useEffect(() => {
    if (agentInfo) {
      setFormData({
        direct_line: agentInfo.direct_line || "",
        email: agentInfo.email || "",
        resident_location: agentInfo.resident_location || "",
        years_of_service_date: agentInfo.years_of_service_date 
          ? new Date(agentInfo.years_of_service_date) 
          : null,
        line_authority: agentInfo.line_authority || [],
        active_state_licenses: agentInfo.active_state_licenses || [],
        national_producer_number: agentInfo.national_producer_number || "",
        resident_license_number: agentInfo.resident_license_number || "",
        doj_background_check_date: agentInfo.doj_background_check_date 
          ? new Date(agentInfo.doj_background_check_date) 
          : null,
        live_scan_date: agentInfo.live_scan_date 
          ? new Date(agentInfo.live_scan_date) 
          : null,
        continuing_education_date: agentInfo.continuing_education_date 
          ? new Date(agentInfo.continuing_education_date) 
          : null,
        resident_license_status_date: agentInfo.resident_license_status_date 
          ? new Date(agentInfo.resident_license_status_date) 
          : null,
        resident_license_renewal_date: agentInfo.resident_license_renewal_date 
          ? new Date(agentInfo.resident_license_renewal_date) 
          : null,
      });
    }
  }, [agentInfo]);

  const handleFieldChange = (field: keyof AgentInfoData, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      const formattedData = {
        ...formData,
        years_of_service_date: formData.years_of_service_date instanceof Date 
          ? formData.years_of_service_date.toISOString() 
          : formData.years_of_service_date,
        doj_background_check_date: formData.doj_background_check_date instanceof Date 
          ? formData.doj_background_check_date.toISOString() 
          : formData.doj_background_check_date,
        live_scan_date: formData.live_scan_date instanceof Date 
          ? formData.live_scan_date.toISOString() 
          : formData.live_scan_date,
        continuing_education_date: formData.continuing_education_date instanceof Date 
          ? formData.continuing_education_date.toISOString() 
          : formData.continuing_education_date,
        resident_license_status_date: formData.resident_license_status_date instanceof Date 
          ? formData.resident_license_status_date.toISOString() 
          : formData.resident_license_status_date,
        resident_license_renewal_date: formData.resident_license_renewal_date instanceof Date 
          ? formData.resident_license_renewal_date.toISOString() 
          : formData.resident_license_renewal_date,
      };
      
      onUpdate({ agent_info: formattedData });
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert dates to ISO strings for database storage
    const formattedData = {
      ...formData,
      years_of_service_date: formData.years_of_service_date instanceof Date 
        ? formData.years_of_service_date.toISOString() 
        : formData.years_of_service_date,
      doj_background_check_date: formData.doj_background_check_date instanceof Date 
        ? formData.doj_background_check_date.toISOString() 
        : formData.doj_background_check_date,
      live_scan_date: formData.live_scan_date instanceof Date 
        ? formData.live_scan_date.toISOString() 
        : formData.live_scan_date,
      continuing_education_date: formData.continuing_education_date instanceof Date 
        ? formData.continuing_education_date.toISOString() 
        : formData.continuing_education_date,
      resident_license_status_date: formData.resident_license_status_date instanceof Date 
        ? formData.resident_license_status_date.toISOString() 
        : formData.resident_license_status_date,
      resident_license_renewal_date: formData.resident_license_renewal_date instanceof Date 
        ? formData.resident_license_renewal_date.toISOString() 
        : formData.resident_license_renewal_date,
    };
    
    onUpdate({ agent_info: formattedData });
    setIsEditing(false);
  };

  return {
    isEditing,
    formData,
    handleFieldChange,
    handleToggleEdit,
    handleSubmit
  };
};
