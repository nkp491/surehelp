import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";
import { validateFile, formatFileSize } from "@/utils/fileValidation";

interface ProfileImageProps {
  imageUrl: string | null;
  firstName: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploading: boolean;
}

const ProfileImage = ({ imageUrl, firstName, onUpload, uploading }: ProfileImageProps) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(imageUrl);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validate file using utility function
      const validation = validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'gif']
      });

      if (!validation.isValid) {
        // Provide more detailed error message for file size issues
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File size too large (${formatFileSize(file.size)}). Please upload an image smaller than 5MB.`);
        }
        throw new Error(validation.error || 'Invalid file');
      }

      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Call the parent's onUpload handler
      await onUpload(event);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Error uploading image",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={preview || imageUrl || ""} />
          <AvatarFallback className="text-foreground">
            {firstName?.[0]?.toUpperCase() || <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="text-foreground"
          />
          <p className="text-sm text-foreground mt-1">
            {uploading ? "Uploading..." : "Click to upload a new profile picture (max 5MB)"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileImage;