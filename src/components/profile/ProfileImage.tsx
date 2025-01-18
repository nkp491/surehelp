import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ProfileImageProps {
  imageUrl: string | null;
  firstName: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploading: boolean;
}

const ProfileImage = ({ imageUrl, firstName, onUpload, uploading }: ProfileImageProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={imageUrl || ""} />
          <AvatarFallback className="text-foreground">
            {firstName?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={onUpload}
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