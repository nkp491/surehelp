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
  onSort: (key: keyof FormSubmission) => void;
}

export const SubmissionTabs = ({
  submissions,
  onEdit,
  onDelete,
  onViewProfile,
  onSort
}: SubmissionTabsProps) => {
  return (
    <Tabs defaultValue="protected" className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">CLIENT SUBMISSIONS</h2>
        <TabsList className="grid w-[400px] grid-cols-3">
          <TabsTrigger 
            value="protected" 
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            Protected ({submissions.protected.length})
          </TabsTrigger>
          <TabsTrigger 
            value="follow-up" 
            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white"
          >
            Follow-up ({submissions.followUp.length})
          </TabsTrigger>
          <TabsTrigger 
            value="declined" 
            className="data-[state=active]:bg-red-500 data-[state=active]:text-white"
          >
            Declined ({submissions.declined.length})
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="protected">
        <SubmissionsList 
          submissions={submissions.protected}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewProfile={onViewProfile}
          onSort={onSort}
        />
      </TabsContent>

      <TabsContent value="follow-up">
        <SubmissionsList 
          submissions={submissions.followUp}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewProfile={onViewProfile}
          onSort={onSort}
        />
      </TabsContent>

      <TabsContent value="declined">
        <SubmissionsList 
          submissions={submissions.declined}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewProfile={onViewProfile}
          onSort={onSort}
        />
      </TabsContent>
    </Tabs>
  );
};