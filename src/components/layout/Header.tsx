import Navigation from "./Navigation";
import ProfileMenu from "./ProfileMenu";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <img 
              src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png" 
              alt="SureHelp Logo" 
              className="h-8 w-auto"
            />
            <Navigation />
          </div>

          {/* Profile Section */}
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;