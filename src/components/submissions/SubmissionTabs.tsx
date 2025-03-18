
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormSubmission } from "@/types/form";
import SubmissionsList from "./SubmissionsList";

interface SubmissionTabsProps {
  submissions: {
    protected: FormSubmission[];
    followUp: FormSubmission[];
    declined: FormSubmission[];
  };
  onEdit: (submission: FormSubmission) => void;
  onDelete: (submission: FormSubmission) => void;
  onViewProfile: (submission: FormSubmission) => void;
  onSort: (field: keyof FormSubmission) => void;
  onBackdate?: (submission: FormSubmission) => void;
}

export function SubmissionTabs({
  submissions,
  onEdit,
  onDelete,
  onViewProfile,
  onSort,
  onBackdate
}: SubmissionTabsProps) {
  return (
    <Tabs defaultValue="protected" className="w-full">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="protected" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
          Protected
        </TabsTrigger>
        <TabsTrigger value="follow-up" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white">
          Follow-Up
        </TabsTrigger>
        <TabsTrigger value="declined" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
          Declined
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="protected">
        <SubmissionsList
          submissions={submissions.protected}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewProfile={onViewProfile}
          onSort={onSort}
          onBackdate={onBackdate}
        />
      </TabsContent>
      
      <TabsContent value="follow-up">
        <SubmissionsList
          submissions={submissions.followUp}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewProfile={onViewProfile}
          onSort={onSort}
          onBackdate={onBackdate}
        />
      </TabsContent>
      
      <TabsContent value="declined">
        <SubmissionsList
          submissions={submissions.declined}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewProfile={onViewProfile}
          onSort={onSort}
          onBackdate={onBackdate}
        />
      </TabsContent>
    </Tabs>
  );
}
