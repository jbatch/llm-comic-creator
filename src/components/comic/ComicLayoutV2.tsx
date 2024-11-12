import React, { useState, useEffect } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronLeft,
  LoaderCircle,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { exportToPDF } from "@/utils/pdfExport";
import { toast } from "@/hooks/use-toast";
import { ComicPreview } from "./preview/ComicPreview";

interface Panel {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutTemplate {
  id: string;
  name: string;
  panels: Panel[];
}

interface LayoutPreviewProps {
  layout: LayoutTemplate;
  isSelected: boolean;
  onClick: () => void;
}

interface ComicPanel {
  imagePrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

interface PageData {
  layout: LayoutTemplate;
  startIndex: number;
}

const layoutTemplates: LayoutTemplate[] = [
  {
    id: "grid2x2",
    name: "2x2 Grid",
    panels: [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 50, y: 0, width: 50, height: 50 },
      { x: 0, y: 50, width: 50, height: 50 },
      { x: 50, y: 50, width: 50, height: 50 },
    ],
  },
  {
    id: "threeTop",
    name: "Three Top",
    panels: [
      { x: 0, y: 0, width: 33.33, height: 50 },
      { x: 33.33, y: 0, width: 33.33, height: 50 },
      { x: 66.66, y: 0, width: 33.33, height: 50 },
      { x: 0, y: 50, width: 100, height: 50 },
    ],
  },
  {
    id: "spotlight",
    name: "Spotlight",
    panels: [
      { x: 0, y: 0, width: 100, height: 50 },
      { x: 0, y: 50, width: 33.33, height: 50 },
      { x: 33.33, y: 50, width: 33.33, height: 50 },
      { x: 66.66, y: 50, width: 33.33, height: 50 },
    ],
  },
];

const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  layout,
  isSelected,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-24 h-24 border-2 relative ${
      isSelected ? "border-blue-500" : "border-gray-200"
    }`}
  >
    {layout.panels.map((panel, idx) => (
      <div
        key={idx}
        className="absolute bg-gray-100"
        style={{
          left: `${panel.x}%`,
          top: `${panel.y}%`,
          width: `${panel.width}%`,
          height: `${panel.height}%`,
          border: "1px solid #e5e7eb",
        }}
      />
    ))}
    <div className="absolute bottom-0 left-0 right-0 bg-white/90 text-xs p-1 text-center">
      {layout.name}
    </div>
  </button>
);

const PageThumbnail: React.FC<{
  layout: LayoutTemplate;
  panels: ComicPanel[];
  startIndex: number;
  isSelected: boolean;
  pageNumber: number;
  onClick: () => void;
}> = ({ layout, panels, startIndex, isSelected, pageNumber, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "relative w-32 aspect-[1.4142] bg-white rounded-lg overflow-hidden transition-all",
      "hover:ring-2 hover:ring-blue-200 hover:shadow-md",
      "focus:outline-none focus:ring-2 focus:ring-blue-500",
      isSelected && "ring-2 ring-blue-500 shadow-md",
      !isSelected && "border border-gray-200"
    )}
  >
    {layout.panels.map((panel, index) => {
      const imageIndex = startIndex + index;
      const image = panels[imageIndex];

      return (
        <div
          key={index}
          className="absolute"
          style={{
            left: `${panel.x}%`,
            top: `${panel.y}%`,
            width: `${panel.width}%`,
            height: `${panel.height}%`,
            padding: "1px",
          }}
        >
          {image?.imageUrl ? (
            <img
              src={image.imageUrl}
              alt={`Panel ${imageIndex + 1}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>
      );
    })}
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 py-1 px-2 text-xs text-center",
        "bg-white/90 backdrop-blur-sm border-t border-gray-100",
        isSelected && "bg-blue-50/90 text-blue-700"
      )}
    >
      Page {pageNumber}
    </div>
  </button>
);

const ComicLayoutV2: React.FC = () => {
  const location = useLocation();
  const initialPanels = location.state?.panels as ComicPanel[] | undefined;
  const [panels, setPanels] = useState<ComicPanel[]>(initialPanels || []);
  const [currentPage, setCurrentPage] = useState(0);
  const [pages, setPages] = useState<PageData[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

  useEffect(() => {
    // Initialize with first page if none exist
    if (pages.length === 0 && panels) {
      setPages([{ layout: layoutTemplates[0], startIndex: 0 }]);
    }
  }, [panels, pages.length]);

  if (!panels || !Array.isArray(panels) || panels.length === 0) {
    return <Navigate to="/panels" replace />;
  }

  const allPanelsHaveImages = panels.every((panel) => panel.imageUrl);

  if (!allPanelsHaveImages) {
    return <Navigate to="/panels" replace />;
  }

  const addPage = () => {
    const newPageIndex = pages.length;
    setPages([
      ...pages,
      {
        layout: layoutTemplates[0],
        startIndex: pages.reduce(
          (acc, page) => acc + page.layout.panels.length,
          0
        ),
      },
    ]);
    setCurrentPage(newPageIndex); // Auto-select the new page
  };

  const removePage = (index: number) => {
    const newPages = pages.filter((_, i) => i !== index);
    // Recalculate startIndex for all pages after removal
    newPages.forEach((page, i) => {
      if (i > 0) {
        page.startIndex =
          newPages[i - 1].startIndex + newPages[i - 1].layout.panels.length;
      }
    });
    setPages(newPages);
    setCurrentPage(Math.min(currentPage, newPages.length - 1));
  };

  const updatePageLayout = (index: number, layout: LayoutTemplate) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], layout };
    // Recalculate startIndex for subsequent pages
    for (let i = index + 1; i < newPages.length; i++) {
      newPages[i].startIndex =
        newPages[i - 1].startIndex + newPages[i - 1].layout.panels.length;
    }
    setPages(newPages);
  };

  const handleUpdatePanel = (
    panelIndex: number,
    updates: Partial<ComicPanel>
  ) => {
    setPanels((currentPanels) => {
      const newPanels = [...currentPanels];
      newPanels[panelIndex] = {
        ...newPanels[panelIndex],
        ...updates,
      };
      return newPanels;
    });

    // Show a toast notification to confirm the update
    toast({
      title: "Panel Updated",
      description: "Panel crop settings have been saved.",
      duration: 2000,
    });
  };

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      console.log("Starting export with panels:", panels);
      await exportToPDF(pages, panels, { title: "My Comic", orientation });
      toast({
        title: "Export Successful",
        description: "Your comic has been exported to PDF.",
      });
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description:
          "Failed to generate PDF. Please check console for details.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const unusedPanels =
    panels.length -
    pages.reduce((acc, page) => acc + page.layout.panels.length, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center space-x-2 text-sm">
            <Link
              to="/panels"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Panels
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Page Navigation */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pages</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={addPage}
                disabled={unusedPanels <= 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Page
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {pages.map((page, index) => (
                  <PageThumbnail
                    key={index}
                    layout={page.layout}
                    panels={panels}
                    startIndex={page.startIndex}
                    isSelected={currentPage === index}
                    pageNumber={index + 1}
                    onClick={() => setCurrentPage(index)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layout Selection */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Page {currentPage + 1} Layout</CardTitle>
              {pages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePage(currentPage)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Page
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                {layoutTemplates.map((layout) => (
                  <LayoutPreview
                    key={layout.id}
                    layout={layout}
                    isSelected={pages[currentPage]?.layout.id === layout.id}
                    onClick={() => updatePageLayout(currentPage, layout)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Comic Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preview</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setOrientation((prev) =>
                    prev === "portrait" ? "landscape" : "portrait"
                  )
                }
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {orientation === "portrait" ? "Portrait" : "Landscape"}
              </Button>
            </CardHeader>
            <CardContent>
              {pages[currentPage] && (
                <ComicPreview
                  layout={pages[currentPage].layout}
                  panels={panels}
                  startIndex={pages[currentPage].startIndex}
                  pageIndex={currentPage}
                  orientation={orientation}
                  onUpdatePanel={handleUpdatePanel}
                />
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="text-sm text-gray-500">
            {unusedPanels > 0 ? (
              <p>
                {unusedPanels} panel{unusedPanels !== 1 ? "s" : ""} remaining to
                be placed
              </p>
            ) : unusedPanels < 0 ? (
              <p className="text-red-500">
                Warning: Current layout requires {Math.abs(unusedPanels)} more
                panel{Math.abs(unusedPanels) !== 1 ? "s" : ""} than available
              </p>
            ) : (
              <p className="text-green-500">All panels have been placed</p>
            )}
          </div>

          {/* Export Options */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="print:hidden"
            >
              {isExporting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                "Export as PDF"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            background: white;
          }
          nav, .print\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ComicLayoutV2;
