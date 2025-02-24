
import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";
import AuthGuard from "@/components/auth/AuthGuard";

const Index = () => {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Header />
        <div className="w-full">
          <MainContent />
        </div>
      </div>
    </AuthGuard>
  );
};

export default Index;
