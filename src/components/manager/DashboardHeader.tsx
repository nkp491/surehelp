import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserPlus } from "lucide-react";
import { useState } from "react";

interface DashboardHeaderProps {
  onInviteMember: (email: string) => Promise<void>;
}

const DashboardHeader = ({ onInviteMember }: DashboardHeaderProps) => {
  const [inviteEmail, setInviteEmail] = useState("");

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8]">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
        <p className="text-muted-foreground mt-1">Manage your team and view performance metrics</p>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => {
                onInviteMember(inviteEmail);
                setInviteEmail("");
              }} 
              className="w-full"
            >
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardHeader;