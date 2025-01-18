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
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center space-x-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={imageUrl || ""} />
          <AvatarFallback>
            {firstName?.[0]?.toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
          />
          <p className="text-sm text-gray-500 mt-1">
            {uploading ? "Uploading..." : "Click to upload a new profile picture"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileImage;