
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  imagePath: string;
  altText: string;
}

const FeatureCard = ({ title, description, imagePath, altText }: FeatureCardProps) => {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Card 
      className={`
        relative h-[400px] rounded-xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer border-0
        ${isSelected ? 'bg-white' : 'bg-white hover:bg-emerald-50'}
      `}
      onClick={() => setIsSelected(!isSelected)}
    >
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isSelected ? 'h-0 opacity-0' : 'h-3/4'}
          w-full overflow-hidden relative
          bg-gradient-to-r from-[#2A0068] to-[#130032]
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#2A0068] via-[#2A0068] to-transparent w-1/3" />
        <img 
          src={imagePath} 
          alt={altText}
          className={`
            w-2/3 h-full object-cover absolute
            transition-transform duration-300
            ${isSelected ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'}
            right-0 
            ${altText === "Lead Information Form" ? 'object-top' : 'object-top'}
          `}
        />
      </div>
      
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isSelected ? 'h-full pt-8' : 'h-1/4'}
          w-full px-6 py-4 absolute bottom-0 left-0
        `}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-xl font-semibold ${isSelected ? 'text-[#1A1F2C]' : 'text-gray-900'}`}>
              {title}
            </h3>
            <div 
              className={`
                transition-all duration-300 delay-100
                ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              {isSelected && (
                <p className="text-base text-[#1A1F2C]/90 mt-6">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div 
            className={`
              transition-transform duration-300
              ${isSelected ? 'rotate-45' : 'rotate-0'}
            `}
          >
            <Plus className={isSelected ? 'text-[#1A1F2C]' : 'text-gray-600'} size={24} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default FeatureCard;
