
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";

const NavBar = () => {
  const navigate = useNavigate();
  const { isLogin } = useAuthState();

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
            <img 
              src="/lovable-uploads/b13a0f6e-9e88-478b-b26d-66c2b71c55c0.png"
              alt="SureHelp Logo"
              className="h-8 cursor-pointer"
              onClick={() => navigate('/')}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/about')} className="text-white hover:bg-white hover:text-[#0096C7]">
              About
            </Button>
            <Button variant="ghost" onClick={() => navigate('/pricing')} className="text-white hover:bg-white hover:text-[#0096C7]">
              Pricing
            </Button>
            <Button variant="ghost" onClick={scrollToContact} className="text-white hover:bg-white hover:text-[#0096C7]">
              Contact Us
            </Button>
            {isLogin ? 
            <Button 
              onClick={() => navigate('/assessment')}
              className="bg-white text-[#0096C7] hover:bg-white/90"
            >
              Go to Dashboard
            </Button>
            :
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-white text-[#0096C7] hover:bg-white/90"
            >
              Login
            </Button>
            }
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
