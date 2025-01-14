import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-[#6CAEC2] flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-white">Welcome to the Dashboard</h1>
        <p className="text-white/80">Choose your role to continue</p>
        <div className="space-x-4">
          <Button asChild>
            <Link to="/manager">Manager Dashboard</Link>
          </Button>
          <Button asChild>
            <Link to="/agent">Agent Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}