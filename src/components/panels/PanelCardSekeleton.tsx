import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const PanelCardSkeleton: React.FC = () => (
  <Card className="animate-pulse">
    <CardHeader>
      <div className="h-6 bg-gray-200 rounded w-24"></div>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="bg-gray-200 w-full aspect-video rounded"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </CardContent>
  </Card>
);

export default PanelCardSkeleton;
