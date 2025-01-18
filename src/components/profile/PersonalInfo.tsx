import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfoProps {
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  onUpdate: (updates: Partial<Profile>) => Promise<void>;
}

const PersonalInfo = ({ firstName, lastName, email, phone, onUpdate }: PersonalInfoProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName || ""}
              onChange={(e) => onUpdate({ first_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName || ""}
              onChange={(e) => onUpdate({ last_name: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email || ""}
            onChange={(e) => onUpdate({ email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone || ""}
            onChange={(e) => onUpdate({ phone: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfo;