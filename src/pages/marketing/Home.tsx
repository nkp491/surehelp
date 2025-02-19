
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useNavigate } from "react-router-dom";

const navigationItems = [
  { label: "Products", href: "/products" },
  { label: "Pricing", href: "/pricing" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-[#2A6F97] to-[#2A6F97]/80 min-h-screen">
      <div className="container mx-auto max-w-[95vw] lg:max-w-[1400px] relative">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 md:px-20 py-4 border-b border-white/20">
          <span 
            onClick={() => navigate('/')} 
            className="text-2xl font-bold text-white cursor-pointer"
          >
            SureHelp
          </span>

          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-8">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.href);
                    }}
                    className="text-sm text-white hover:text-white/80 transition-colors cursor-pointer"
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
              <Button
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="bg-white/85 text-[#2A6F97] font-extrabold rounded-lg px-4 py-1.5"
              >
                Login
              </Button>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        {/* Hero Section */}
        <div className="px-6 md:px-20 pt-24">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1">
              <h1 className="text-4xl md:text-[64px] text-white leading-tight">
                <span className="font-black">Supercharge your </span>
                <span className="font-normal">insurance process.</span>
              </h1>

              <p className="mt-8 text-white/80 max-w-[417px]">
                The Agent Hub will organize and optimize your client data while
                the KPI analytics will help you manage your team performance.
              </p>

              <Button 
                onClick={() => navigate('/auth')}
                className="mt-8 bg-white text-[#2A6F97] rounded-full px-8 py-3 hover:bg-white/90"
              >
                Get Started
              </Button>
            </div>

            <div className="flex-1 mt-12 lg:mt-0">
              <div className="w-full h-[630px] bg-white/10 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
