
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
        relative h-[400px] rounded-xl overflow-hidden transition-all duration-300 ease-in-out cursor-pointer
        ${isSelected ? 'bg-gradient-to-b from-[#0096C7] to-[#002DCB] text-white' : 'bg-white hover:bg-emerald-50'}
      `}
      onClick={() => setIsSelected(!isSelected)}
    >
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${isSelected ? 'h-0 opacity-0' : 'h-3/4'}
          w-full overflow-hidden bg-gradient-to-b from-emerald-400 to-emerald-300 relative
        `}
      >
        <img 
          src={imagePath} 
          alt={altText}
          className={`
            w-[120%] h-full object-cover object-top absolute -right-[20%]
            transition-transform duration-300
            ${isSelected ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'}
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
            <h3 className={`font-semibold text-lg ${isSelected ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <div 
              className={`
                transition-all duration-300 delay-100
                ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}
            >
              {isSelected && (
                <>
                  <p className="text-sm text-white/90 mt-2 mb-4">
                    {description}
                  </p>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white">Key Features:</h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-white/90">
                      <li>Enhanced user experience with intuitive design</li>
                      <li>Seamless integration with existing systems</li>
                      <li>Real-time updates and notifications</li>
                      <li>Customizable to meet your specific needs</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
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
      </div>
    </Card>
  );
};

export default FeatureCard;

