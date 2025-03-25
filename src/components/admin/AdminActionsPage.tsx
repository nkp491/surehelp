
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleUserRoleManager } from "./SingleUserRoleManager";
import { BulkUserRoleManager } from "./BulkUserRoleManager";
import { Toaster } from "@/components/ui/toaster";

export default function AdminActionsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="single">Single User Actions</TabsTrigger>
          <TabsTrigger value="bulk">Bulk User Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <SingleUserRoleManager />
        </TabsContent>
        
        <TabsContent value="bulk">
          <BulkUserRoleManager />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
