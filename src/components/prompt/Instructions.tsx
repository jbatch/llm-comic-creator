// src/components/prompt/Instructions.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Instructions: React.FC = () => (
  <Card className="bg-blue-50 border-blue-200">
    <CardHeader className="py-3">
      <CardTitle className="text-blue-800 text-sm">Writing Tips</CardTitle>
    </CardHeader>
    <CardContent className="text-blue-600 text-xs py-2">
      <ul className="list-disc list-inside space-y-1">
        <li>Be specific about setting, characters, and tone</li>
        <li>Include key plot points and story elements</li>
        <li>Specify desired length and style</li>
        <li>Mention themes or messages to convey</li>
      </ul>
    </CardContent>
  </Card>
);

export default Instructions;
