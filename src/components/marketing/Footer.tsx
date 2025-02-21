
import { useNavigate } from "react-router-dom";
import { Mail, Instagram } from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-white/5 backdrop-blur-sm border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between">
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="mailto:contact@surehelp.com" className="text-white/60 hover:text-white">
            <Mail className="h-5 w-5" />
          </a>
          <a href="#" className="text-white/60 hover:text-white">
            <Instagram className="h-5 w-5" />
          </a>
        </div>
        <div className="mt-8 md:order-1 md:mt-0">
          <nav className="flex justify-center space-x-6 mb-4 md:mb-0">
            <button onClick={() => navigate('/about')} className="text-white/60 hover:text-white text-sm">
              About
            </button>
            <button onClick={() => navigate('/pricing')} className="text-white/60 hover:text-white text-sm">
              Pricing
            </button>
            <button onClick={() => navigate('/auth')} className="text-white/60 hover:text-white text-sm">
              Login
            </button>
            <button onClick={() => navigate('/terms')} className="text-white/60 hover:text-white text-sm">
              Terms of Use
            </button>
          </nav>
          <p className="text-center text-xs leading-5 text-white/60">
            &copy; {new Date().getFullYear()} SureHelp. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
