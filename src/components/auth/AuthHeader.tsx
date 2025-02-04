import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AuthHeaderProps {
  view: "sign_in" | "sign_up";
  onViewChange: (value: "sign_in" | "sign_up") => void;
}

const AuthHeader = ({ view, onViewChange }: AuthHeaderProps) => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-[#2A6F97] text-6xl font-bold mb-12">SureHelp</h1>
      <Tabs defaultValue={view} className="w-full" onValueChange={(value) => onViewChange(value as "sign_in" | "sign_up")}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="sign_up">Sign Up</TabsTrigger>
          <TabsTrigger value="sign_in">Sign In</TabsTrigger>
        </TabsList>
        <TabsContent value="sign_up">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Create an account</h2>
          <p className="text-lg text-gray-600 text-center mb-6">Supercharge your process!</p>
        </TabsContent>
        <TabsContent value="sign_in">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Welcome back</h2>
          <p className="text-lg text-gray-600 text-center mb-6">Sign in to your account</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthHeader;