import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User } from "lucide-react";

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
      const fileExt = file.name.split('.').pop();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];

      if (!allowedTypes.includes(fileExt?.toLowerCase() || '')) {
        throw new Error('File type not supported. Please upload a JPG, PNG, or GIF image.');
      }

      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Call the parent's onUpload handler
      await onUpload(event);

    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
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
            {uploading ? "Uploading..." : "Click to upload a new profile picture"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileImage;