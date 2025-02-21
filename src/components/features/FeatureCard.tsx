
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
        relative h-[400px] rounded-xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.02]
        ${isSelected ? 'bg-gradient-to-b from-[#0096C7] to-[#002DCB] text-white' : 'bg-white'}
      `}
      onClick={() => setIsSelected(!isSelected)}
    >
      <div className="h-3/4 w-full overflow-hidden bg-gray-100">
        <img 
          src={imagePath} 
          alt={altText}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="h-1/4 w-full px-6 py-4 flex justify-between items-center">
        <div>
          <h3 className={`font-semibold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          {isSelected && (
            <p className="text-sm text-white/90 mt-1 animate-fade-in">
              {description}
            </p>
          )}
        </div>
        <div 
          className={`
            transition-transform duration-300
            ${isSelected ? 'rotate-45' : 'rotate-0'}
          `}
        >
          <Plus className={isSelected ? 'text-white' : 'text-gray-600'} size={24} />
        </div>
      </div>
    </Card>
  );
};

export default FeatureCard;
