import { TeamBulletInsProps } from "@/types/team";
import { Loader } from "lucide-react";

const TeamBulletIns = ({ bulletins, loading }: TeamBulletInsProps) => {
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-6">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      );
    }
    if (bulletins.length === 0) {
      return (
        <div className="text-center p-6 border rounded-md bg-muted/30">
          <p className="text-lg font-medium mb-2">No bulletins yet</p>
          <p className="text-muted-foreground">There are no bulletins posted for this team yet.</p>
        </div>
      );
    }

    return bulletins.map((bulletin) => (
      <div key={bulletin.title} className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{bulletin.title}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(bulletin.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-gray-600">{bulletin.content}</p>
      </div>
    ));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6">TEAM BULLETIN</h2>
      <div className="space-y-4">{renderContent()}</div>
    </div>
  );
};

export default TeamBulletIns;
