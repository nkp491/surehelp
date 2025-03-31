
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FormField from "@/components/FormField";

interface AgentInformationProps {
  agentInfo?: {
    direct_line?: string | null;
    email?: string | null;
    resident_location?: string | null;
    years_of_service_date?: string | null;
    line_authority?: string | null;
    national_producer_number?: string | null;
    resident_license_number?: string | null;
    doj_background_check_date?: string | null;
    live_scan_date?: string | null;
    continuing_education_date?: string | null;
    resident_license_status_date?: string | null;
    resident_license_renewal_date?: string | null;
  } | null;
  onUpdate: (data: any) => void;
}

const AgentInformation = ({
  agentInfo,
  onUpdate
}: AgentInformationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    direct_line: agentInfo?.direct_line || '',
    email: agentInfo?.email || '',
    resident_location: agentInfo?.resident_location || '',
    years_of_service_date: agentInfo?.years_of_service_date ? new Date(agentInfo.years_of_service_date) : null,
    line_authority: agentInfo?.line_authority || '',
    national_producer_number: agentInfo?.national_producer_number || '',
    resident_license_number: agentInfo?.resident_license_number || '',
    doj_background_check_date: agentInfo?.doj_background_check_date ? new Date(agentInfo.doj_background_check_date) : null,
    live_scan_date: agentInfo?.live_scan_date ? new Date(agentInfo.live_scan_date) : null,
    continuing_education_date: agentInfo?.continuing_education_date ? new Date(agentInfo.continuing_education_date) : null,
    resident_license_status_date: agentInfo?.resident_license_status_date ? new Date(agentInfo.resident_license_status_date) : null,
    resident_license_renewal_date: agentInfo?.resident_license_renewal_date ? new Date(agentInfo.resident_license_renewal_date) : null,
  });

  const { language } = useLanguage();
  const t = translations[language];

  // Update form data when props change
  useEffect(() => {
    if (agentInfo) {
      setFormData({
        direct_line: agentInfo.direct_line || '',
        email: agentInfo.email || '',
        resident_location: agentInfo.resident_location || '',
        years_of_service_date: agentInfo.years_of_service_date ? new Date(agentInfo.years_of_service_date) : null,
        line_authority: agentInfo.line_authority || '',
        national_producer_number: agentInfo.national_producer_number || '',
        resident_license_number: agentInfo.resident_license_number || '',
        doj_background_check_date: agentInfo.doj_background_check_date ? new Date(agentInfo.doj_background_check_date) : null,
        live_scan_date: agentInfo.live_scan_date ? new Date(agentInfo.live_scan_date) : null,
        continuing_education_date: agentInfo.continuing_education_date ? new Date(agentInfo.continuing_education_date) : null,
        resident_license_status_date: agentInfo.resident_license_status_date ? new Date(agentInfo.resident_license_status_date) : null,
        resident_license_renewal_date: agentInfo.resident_license_renewal_date ? new Date(agentInfo.resident_license_renewal_date) : null,
      });
    }
  }, [agentInfo]);

  const handleDateChange = (field: string, date: Date | null) => {
    setFormData({
      ...formData,
      [field]: date
    });
  };

  const handleTextChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert dates to ISO strings for database storage
    const formattedData = {
      ...formData,
      years_of_service_date: formData.years_of_service_date?.toISOString() || null,
      doj_background_check_date: formData.doj_background_check_date?.toISOString() || null,
      live_scan_date: formData.live_scan_date?.toISOString() || null,
      continuing_education_date: formData.continuing_education_date?.toISOString() || null,
      resident_license_status_date: formData.resident_license_status_date?.toISOString() || null,
      resident_license_renewal_date: formData.resident_license_renewal_date?.toISOString() || null,
    };
    
    onUpdate({ agent_info: formattedData });
    setIsEditing(false);
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      const formattedData = {
        ...formData,
        years_of_service_date: formData.years_of_service_date?.toISOString() || null,
        doj_background_check_date: formData.doj_background_check_date?.toISOString() || null,
        live_scan_date: formData.live_scan_date?.toISOString() || null,
        continuing_education_date: formData.continuing_education_date?.toISOString() || null,
        resident_license_status_date: formData.resident_license_status_date?.toISOString() || null,
        resident_license_renewal_date: formData.resident_license_renewal_date?.toISOString() || null,
      };
      
      onUpdate({ agent_info: formattedData });
    }
    setIsEditing(!isEditing);
  };

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
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.directLine}</label>
              {isEditing ? (
                <Input
                  value={formData.direct_line}
                  onChange={(e) => handleTextChange('direct_line', e.target.value)}
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.direct_line || '-'}</p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.email}</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleTextChange('email', e.target.value)}
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.email || '-'}</p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.residentLocation}</label>
              {isEditing ? (
                <Input
                  value={formData.resident_location}
                  onChange={(e) => handleTextChange('resident_location', e.target.value)}
                  className="w-full"
                  placeholder="City, State"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.resident_location || '-'}</p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.yearsOfService}</label>
              {isEditing ? (
                <DatePicker 
                  selected={formData.years_of_service_date}
                  onSelect={(date) => handleDateChange('years_of_service_date', date)}
                  maxDate={new Date()}
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.years_of_service_date 
                    ? new Date(formData.years_of_service_date).toLocaleDateString() 
                    : '-'}
                </p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.lineAuthority}</label>
              {isEditing ? (
                <Select
                  value={formData.line_authority}
                  onValueChange={(value) => handleTextChange('line_authority', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t.selectLineAuthority} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="life">Life</SelectItem>
                    <SelectItem value="accident">Accident</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.line_authority ? 
                    formData.line_authority.charAt(0).toUpperCase() + formData.line_authority.slice(1) : 
                    '-'}
                </p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.nationalProducerNumber}</label>
              {isEditing ? (
                <Input
                  value={formData.national_producer_number}
                  onChange={(e) => handleTextChange('national_producer_number', e.target.value)}
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.national_producer_number || '-'}</p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.residentLicenseNumber}</label>
              {isEditing ? (
                <Input
                  value={formData.resident_license_number}
                  onChange={(e) => handleTextChange('resident_license_number', e.target.value)}
                  className="w-full"
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">{formData.resident_license_number || '-'}</p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.dojBackgroundCheck}</label>
              {isEditing ? (
                <DatePicker 
                  selected={formData.doj_background_check_date}
                  onSelect={(date) => handleDateChange('doj_background_check_date', date)}
                  maxDate={new Date()}
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.doj_background_check_date 
                    ? new Date(formData.doj_background_check_date).toLocaleDateString() 
                    : '-'}
                </p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.liveScanFingerprinting}</label>
              {isEditing ? (
                <DatePicker 
                  selected={formData.live_scan_date}
                  onSelect={(date) => handleDateChange('live_scan_date', date)}
                  maxDate={new Date()}
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.live_scan_date 
                    ? new Date(formData.live_scan_date).toLocaleDateString() 
                    : '-'}
                </p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.continuingEducation}</label>
              {isEditing ? (
                <DatePicker 
                  selected={formData.continuing_education_date}
                  onSelect={(date) => handleDateChange('continuing_education_date', date)}
                  maxDate={new Date()}
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.continuing_education_date 
                    ? new Date(formData.continuing_education_date).toLocaleDateString() 
                    : '-'}
                </p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.residentLicenseStatus}</label>
              {isEditing ? (
                <DatePicker 
                  selected={formData.resident_license_status_date}
                  onSelect={(date) => handleDateChange('resident_license_status_date', date)}
                  maxDate={new Date()}
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.resident_license_status_date 
                    ? new Date(formData.resident_license_status_date).toLocaleDateString() 
                    : '-'}
                </p>
              )}
            </div>
            
            <div className="space-y-2.5">
              <label className="text-sm font-medium text-gray-700">{t.residentLicenseRenewal}</label>
              {isEditing ? (
                <DatePicker 
                  selected={formData.resident_license_renewal_date}
                  onSelect={(date) => handleDateChange('resident_license_renewal_date', date)}
                  maxDate={new Date()}
                />
              ) : (
                <p className="text-base text-gray-900 pt-1">
                  {formData.resident_license_renewal_date 
                    ? new Date(formData.resident_license_renewal_date).toLocaleDateString() 
                    : '-'}
                </p>
              )}
            </div>
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
