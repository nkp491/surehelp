
import { Profile } from "@/types/profile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Award,
  Calendar,
  ChevronUp,
  ChevronDown,
  UserCog
} from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useTeamDirectory } from "@/hooks/useTeamDirectory";

interface MemberDetailDialogProps {
  member: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MemberDetailDialog({ 
  member, 
  open, 
  onOpenChange 
}: MemberDetailDialogProps) {
  const [showReporting, setShowReporting] = useState(false);
  const { getReportingStructure } = useTeamDirectory();
  const [reportingStructure, setReportingStructure] = useState<any>(null);
  const [isLoadingStructure, setIsLoadingStructure] = useState(false);

  const fullName = member 
    ? `${member.first_name || ''} ${member.last_name || ''}`.trim() 
    : '';

  // Format the hire date if available
  const formattedHireDate = member?.hire_date 
    ? format(new Date(member.hire_date), 'MMMM dd, yyyy')
    : null;

  const toggleReportingStructure = async () => {
    if (!member) return;
    
    if (!showReporting) {
      setIsLoadingStructure(true);
      const structure = await getReportingStructure(member.id);
      setReportingStructure(structure);
      setIsLoadingStructure(false);
    }
    
    setShowReporting(!showReporting);
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Team Member Profile</DialogTitle>
          <DialogDescription>
            Detailed information about {fullName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {/* Left column - Basic info */}
          <div className="md:col-span-1 flex flex-col items-center">
            <ProfileAvatar 
              imageUrl={member.profile_image_url}
              firstName={member.first_name}
              className="h-32 w-32"
            />
            
            <h2 className="text-xl font-medium mt-4 text-center">{fullName}</h2>
            
            {member.job_title && (
              <p className="text-muted-foreground mt-1 text-center">{member.job_title}</p>
            )}
            
            <Badge className="mt-2" variant="outline">
              {member.role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
            
            {formattedHireDate && (
              <div className="flex items-center mt-4 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Joined {formattedHireDate}</span>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={toggleReportingStructure}
              disabled={isLoadingStructure}
            >
              {showReporting ? (
                <>
                  <ChevronUp className="mr-1 h-4 w-4" />
                  Hide Reporting
                </>
              ) : (
                <>
                  <ChevronDown className="mr-1 h-4 w-4" />
                  Show Reporting
                </>
              )}
            </Button>
          </div>
          
          {/* Right column - Details */}
          <div className="md:col-span-2">
            <h3 className="font-medium mb-2 flex items-center">
              <UserCog className="h-4 w-4 mr-2" />
              Contact Information
            </h3>
            
            <div className="space-y-2 text-sm">
              {member.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{member.email}</span>
                </div>
              )}
              
              {member.extended_contact?.work_email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{member.extended_contact.work_email} (Work)</span>
                </div>
              )}
              
              {member.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              )}
              
              {member.extended_contact?.work_phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{member.extended_contact.work_phone} (Work)</span>
                </div>
              )}
              
              {member.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{member.location}</span>
                </div>
              )}
              
              {member.department && (
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{member.department}</span>
                </div>
              )}
            </div>
            
            {member.bio && (
              <>
                <Separator className="my-4" />
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </>
            )}
            
            {member.skills && member.skills.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-medium mb-2 flex items-center">
                    <Award className="h-4 w-4 mr-2" />
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            {/* Reporting Structure Section */}
            {showReporting && (
              <>
                <Separator className="my-4" />
                <h3 className="font-medium mb-3">Reporting Structure</h3>
                
                {isLoadingStructure ? (
                  <p className="text-sm text-muted-foreground">Loading reporting structure...</p>
                ) : reportingStructure ? (
                  <div className="space-y-4">
                    {reportingStructure.manager && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Reports To:</h4>
                        <div className="flex items-center p-2 border rounded-md">
                          <ProfileAvatar 
                            imageUrl={reportingStructure.manager.profile_image_url}
                            firstName={reportingStructure.manager.first_name}
                            className="h-10 w-10 mr-3"
                          />
                          <div>
                            <p className="font-medium">{`${reportingStructure.manager.first_name || ''} ${reportingStructure.manager.last_name || ''}`}</p>
                            <p className="text-xs text-muted-foreground">{reportingStructure.manager.job_title || reportingStructure.manager.role?.replace(/_/g, ' ')}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {reportingStructure.directReports && reportingStructure.directReports.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Direct Reports ({reportingStructure.directReports.length}):</h4>
                        <div className="space-y-2">
                          {reportingStructure.directReports.map((report: Profile) => (
                            <div key={report.id} className="flex items-center p-2 border rounded-md">
                              <ProfileAvatar 
                                imageUrl={report.profile_image_url}
                                firstName={report.first_name}
                                className="h-8 w-8 mr-3"
                              />
                              <div>
                                <p className="font-medium">{`${report.first_name || ''} ${report.last_name || ''}`}</p>
                                <p className="text-xs text-muted-foreground">{report.job_title || report.role?.replace(/_/g, ' ')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(!reportingStructure.manager && (!reportingStructure.directReports || reportingStructure.directReports.length === 0)) && (
                      <p className="text-sm text-muted-foreground">No reporting relationships found.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unable to load reporting structure.</p>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
