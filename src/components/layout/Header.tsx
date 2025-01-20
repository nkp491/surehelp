import { memo } from "react";
import Navigation from "./Navigation";
import ProfileMenu from "./ProfileMenu";
import logoImage from "/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png";

const Header = memo(() => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <img 
              src={logoImage}
              alt="SureHelp Logo" 
              className="h-8 w-auto"
              loading="eager"
            />
            <Navigation />
          </div>

          {/* Profile Section */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";

export default Header;