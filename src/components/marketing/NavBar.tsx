
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  const scrollToContact = () => {
    const contactSection = document.querySelector('#contact-section');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#contact-section');
    }
  };

  return (
    <nav className="border-b border-white/20 backdrop-blur-sm fixed w-full z-10">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span 
              className="text-2xl font-bold text-white cursor-pointer" 
              onClick={() => navigate('/')}
            >
              SureHelp
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/about')} className="text-white hover:text-white/90">
              About
            </Button>
            <Button variant="ghost" onClick={() => navigate('/pricing')} className="text-white hover:text-white/90">
              Pricing
            </Button>
            <Button variant="ghost" onClick={scrollToContact} className="text-white hover:text-white/90">
              Contact Us
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-white/25 text-[#33C3F0] hover:bg-white"
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
