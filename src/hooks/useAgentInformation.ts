
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
      console.log("Received agent info:", agentInfo);
      
      // Handle line_authority and active_state_licenses as arrays
      let lineAuthority = agentInfo.line_authority || [];
      if (typeof lineAuthority === 'string') {
        lineAuthority = [lineAuthority];
      } else if (!Array.isArray(lineAuthority)) {
        lineAuthority = [];
      }
      
      let stateLicenses = agentInfo.active_state_licenses || [];
      if (typeof stateLicenses === 'string') {
        stateLicenses = [stateLicenses];
      } else if (!Array.isArray(stateLicenses)) {
        stateLicenses = [];
      }
      
      setFormData({
        direct_line: agentInfo.direct_line || "",
        email: agentInfo.email || "",
        resident_location: agentInfo.resident_location || "",
        years_of_service_date: agentInfo.years_of_service_date || null,
        line_authority: lineAuthority,
        active_state_licenses: stateLicenses,
        national_producer_number: agentInfo.national_producer_number || "",
        resident_license_number: agentInfo.resident_license_number || "",
        doj_background_check_date: agentInfo.doj_background_check_date || null,
        live_scan_date: agentInfo.live_scan_date || null,
        continuing_education_date: agentInfo.continuing_education_date || null,
        resident_license_status_date: agentInfo.resident_license_status_date || null,
        resident_license_renewal_date: agentInfo.resident_license_renewal_date || null,
      });
    }
  }, [agentInfo]);

  const handleFieldChange = (field: keyof AgentInfoData, value: any) => {
    console.log(`Field changed: ${field} to:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    }
    setIsEditing(!isEditing);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Submitting agent info:", formData);
    
    // Format dates for database storage
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
    
    toast({
      title: "Agent information saved",
      description: "Your agent information has been updated successfully."
    });
    
    setIsEditing(false);
  };

  // Calculate years of service based on start date
  const calculateYearsOfService = (serviceDate: string | Date | null | undefined) => {
    if (!serviceDate) return '';
    
    const startDate = new Date(serviceDate);
    const currentDate = new Date();
    
    // Calculate the difference in years
    let years = currentDate.getFullYear() - startDate.getFullYear();
    
    // Adjust for months and days
    if (
      currentDate.getMonth() < startDate.getMonth() || 
      (currentDate.getMonth() === startDate.getMonth() && 
       currentDate.getDate() < startDate.getDate())
    ) {
      years--;
    }
    
    return years;
  };

  // Format date with "Completed (as of M/YEAR)" label
  const formatDateWithLabel = (
    date: string | Date | null | undefined, 
    baseLabel: string, 
    completedText: string
  ) => {
    if (!date) return baseLabel;
    
    const dateObj = new Date(date);
    // Use numeric month format instead of abbreviated month name
    const month = (dateObj.getMonth() + 1).toString(); // getMonth() is 0-indexed
    const year = dateObj.getFullYear();
    
    return `${baseLabel} - ${completedText} ${month}/${year}`;
  };

  return {
    isEditing,
    formData,
    handleFieldChange,
    handleToggleEdit,
    handleSubmit,
    calculateYearsOfService,
    formatDateWithLabel
  };
};
