import Header from "@/components/layout/Header";
import MainContent from "@/components/layout/MainContent";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <div className="container mx-auto py-8">
        <MainContent />
      </div>
    </div>
  );
};

export default Index;