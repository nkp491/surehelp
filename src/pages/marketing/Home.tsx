
import NavBar from "@/components/marketing/NavBar";
import HeroSection from "@/components/marketing/HeroSection";
import FeaturesGrid from "@/components/features/FeaturesGrid";

const Home = () => {
  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-gradient-to-b from-[#0096C7] to-[#002DCB]">
      <NavBar />
      <main className="w-screen">
        <HeroSection />
        <FeaturesGrid />
      </main>
    </div>
  );
};

export default Home;
