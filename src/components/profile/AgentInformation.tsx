
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import FormField from "./agent/FormField";
import LineAuthorityField from "./agent/LineAuthorityField";
import StatesField from "./agent/StatesField";
import { useAgentInformation, AgentInfoData } from "@/hooks/useAgentInformation";

interface AgentInformationProps {
  agentInfo?: AgentInfoData | null;
  onUpdate: (data: any) => void;
}

const AgentInformation = ({
  agentInfo,
  onUpdate
}: AgentInformationProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const {
    isEditing,
    formData,
    handleFieldChange,
    handleToggleEdit,
    handleSubmit
  } = useAgentInformation(agentInfo, onUpdate);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">{t.agentInformation}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleEdit}
          className="px-4"
        >
          {isEditing ? t.save : t.edit}
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Direct Line */}
            <FormField
              label={t.directLine}
              type="text"
              value={formData.direct_line || ""}
              onChange={(value) => handleFieldChange('direct_line', value)}
              isEditing={isEditing}
            />
            
            {/* Email */}
            <FormField
              label={t.email}
              type="email"
              value={formData.email || ""}
              onChange={(value) => handleFieldChange('email', value)}
              isEditing={isEditing}
            />
            
            {/* Resident Location - Changed to use StatesField */}
            <StatesField
              label={t.residentLocation}
              value={formData.resident_location || ""}
              onChange={(value) => handleFieldChange('resident_location', value)}
              isEditing={isEditing}
              placeholder={t.selectState}
              multiSelect={false}
            />
            
            {/* Years of Service */}
            <FormField
              label={t.yearsOfService}
              type="date"
              value={formData.years_of_service_date}
              onChange={(value) => handleFieldChange('years_of_service_date', value)}
              isEditing={isEditing}
            />
            
            {/* Line Authority - Multi-select */}
            <LineAuthorityField
              label={t.lineAuthority}
              value={formData.line_authority || []}
              onChange={(value) => handleFieldChange('line_authority', value)}
              isEditing={isEditing}
              placeholder={t.selectLineAuthority}
            />
            
            {/* Active State Licenses - Multi-select */}
            <StatesField
              label={t.activeStateLicenses}
              value={formData.active_state_licenses || []}
              onChange={(value) => handleFieldChange('active_state_licenses', value)}
              isEditing={isEditing}
              placeholder={t.selectStateLicenses}
              multiSelect={true}
            />
            
            {/* National Producer Number */}
            <FormField
              label={t.nationalProducerNumber}
              type="text"
              value={formData.national_producer_number || ""}
              onChange={(value) => handleFieldChange('national_producer_number', value)}
              isEditing={isEditing}
            />
            
            {/* Resident License Number */}
            <FormField
              label={t.residentLicenseNumber}
              type="text"
              value={formData.resident_license_number || ""}
              onChange={(value) => handleFieldChange('resident_license_number', value)}
              isEditing={isEditing}
            />
            
            {/* DOJ Background Check */}
            <FormField
              label={t.dojBackgroundCheck}
              type="date"
              value={formData.doj_background_check_date}
              onChange={(value) => handleFieldChange('doj_background_check_date', value)}
              isEditing={isEditing}
            />
            
            {/* Live Scan Fingerprinting */}
            <FormField
              label={t.liveScanFingerprinting}
              type="date"
              value={formData.live_scan_date}
              onChange={(value) => handleFieldChange('live_scan_date', value)}
              isEditing={isEditing}
            />
            
            {/* Continuing Education */}
            <FormField
              label={t.continuingEducation}
              type="date"
              value={formData.continuing_education_date}
              onChange={(value) => handleFieldChange('continuing_education_date', value)}
              isEditing={isEditing}
            />
            
            {/* Resident License Status */}
            <FormField
              label={t.residentLicenseStatus}
              type="date"
              value={formData.resident_license_status_date}
              onChange={(value) => handleFieldChange('resident_license_status_date', value)}
              isEditing={isEditing}
            />
            
            {/* Resident License Renewal */}
            <FormField
              label={t.residentLicenseRenewal}
              type="date"
              value={formData.resident_license_renewal_date}
              onChange={(value) => handleFieldChange('resident_license_renewal_date', value)}
              isEditing={isEditing}
            />
          </div>
          
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit">{t.save}</Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AgentInformation;
