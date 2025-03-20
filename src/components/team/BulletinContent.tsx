
import React from "react";
import DOMPurify from "dompurify";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import { useTeamMembers } from "@/hooks/team/useTeamMembers";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BulletinContentProps {
  content: string;
  mentionedUsers?: string[];
}

export function BulletinContent({ content, mentionedUsers = [] }: BulletinContentProps) {
  const { members } = useTeamMembers();

  // Convert markdown to HTML
  const processContent = async (content: string) => {
    try {
      const file = await unified()
        .use(remarkParse)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeSanitize)
        .use(rehypeStringify)
        .process(content);
      
      return String(file);
    } catch (error) {
      console.error("Error processing markdown:", error);
      return content;
    }
  };

  const [processedContent, setProcessedContent] = React.useState(content);

  React.useEffect(() => {
    const processMarkdown = async () => {
      const processed = await processContent(content);
      setProcessedContent(processed);
    };
    
    processMarkdown();
  }, [content]);

  // Find mentioned team members
  const mentionedMembers = React.useMemo(() => {
    if (!members) return [];
    return members.filter(member => mentionedUsers.includes(member.user_id));
  }, [members, mentionedUsers]);

  return (
    <div>
      <div 
        className="prose prose-sm max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(processedContent) }}
      />

      {mentionedMembers.length > 0 && (
        <div className="mt-3 pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-1">Mentions:</p>
          <div className="flex flex-wrap gap-2">
            {mentionedMembers.map(member => (
              <Badge key={member.user_id} variant="secondary" className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={member.profile_image_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {(member.first_name || '?')[0]}
                  </AvatarFallback>
                </Avatar>
                <span>
                  {member.first_name} {member.last_name}
                </span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
