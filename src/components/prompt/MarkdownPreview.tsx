import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Save } from "lucide-react";

interface MarkdownPreviewProps {
  content: string | null;
  isLoading: boolean;
  onSave?: (newContent: string) => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  isLoading,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(content || "");

  const handleSave = () => {
    onSave?.(editableContent);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="py-3 border-b">
          <CardTitle>Generated Content</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-theme(spacing.14))]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="h-full">
        <CardHeader className="py-3 border-b">
          <CardTitle>Generated Content</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[calc(100%-theme(spacing.14))]">
          <p className="text-gray-500">Generated content will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3 border-b shrink-0 flex flex-row items-center justify-between">
        <CardTitle>Generated Content</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setEditableContent(content);
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0 grow overflow-hidden">
        <div className="h-full overflow-y-auto px-6 py-4">
          {isEditing ? (
            <Textarea
              value={editableContent}
              onChange={(e) => setEditableContent(e.target.value)}
              className="min-h-full w-full font-mono text-sm"
            />
          ) : (
            <div className="prose prose-sm max-w-none prose-pre:bg-gray-50">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarkdownPreview;
