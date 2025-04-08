
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PlaceholderContentProps {
  title: string;
  description: string;
}

export function PlaceholderContent({ title, description }: PlaceholderContentProps) {
  return (
    <Card className="p-4 h-full">
      <CardHeader className="px-0 pt-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">
          {title} coming soon!
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
