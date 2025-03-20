
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
}

export function RichTextEditor({ value, onChange, id, placeholder }: RichTextEditorProps) {
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSelectionChange = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      setSelectionStart(textarea.selectionStart);
      setSelectionEnd(textarea.selectionEnd);
    }
  };

  const insertFormatting = (
    before: string,
    after: string,
    defaultText?: string
  ) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selectedText = value.substring(selectionStart, selectionEnd);
    const textToInsert = selectedText || defaultText || "";
    const newValue =
      value.substring(0, selectionStart) +
      before +
      textToInsert +
      after +
      value.substring(selectionEnd);

    onChange(newValue);

    // Set cursor after the inserted text on the next render
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectionStart + before.length + textToInsert.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatText = (type: string) => {
    switch (type) {
      case "bold":
        insertFormatting("**", "**", "bold text");
        break;
      case "italic":
        insertFormatting("*", "*", "italic text");
        break;
      case "list":
        insertFormatting("\n- ", "", "List item");
        break;
      case "ordered-list":
        insertFormatting("\n1. ", "", "List item");
        break;
      case "quote":
        insertFormatting("\n> ", "", "Quoted text");
        break;
      case "code":
        insertFormatting("`", "`", "code");
        break;
      case "link":
        insertFormatting("[", "](url)", "link text");
        break;
      case "align-left":
        insertFormatting("<div style=\"text-align: left;\">", "</div>", "Left aligned text");
        break;
      case "align-center":
        insertFormatting("<div style=\"text-align: center;\">", "</div>", "Centered text");
        break;
      case "align-right":
        insertFormatting("<div style=\"text-align: right;\">", "</div>", "Right aligned text");
        break;
      default:
        break;
    }
  };

  return (
    <div className="border rounded-md">
      <div className="flex flex-wrap px-3 py-2 border-b">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("bold")}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("italic")}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("ordered-list")}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("quote")}
              >
                <Quote className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quote</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("code")}
              >
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("link")}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Link</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1"></div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("align-left")}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("align-center")}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => formatText("align-right")}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] border-0 rounded-t-none resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
        onSelect={handleSelectionChange}
        onClick={handleSelectionChange}
        onKeyUp={handleSelectionChange}
      />
    </div>
  );
}
