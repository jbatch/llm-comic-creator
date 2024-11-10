import React from "react";
import { useLocation, Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const ComicLayout = () => {
  const location = useLocation();
  const panels = location.state?.panels;

  if (!panels || !Array.isArray(panels) || panels.length === 0) {
    return <Navigate to="/panels" replace />;
  }

  // Check if all panels have images

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Comic Layout</h1>

        {/* Comic Grid */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
            {panels.map((panel, index) => (
              <div
                key={index}
                className="relative aspect-video border-8 border-white shadow-lg bg-gray-50"
              >
                {panel.imageUrl && (
                  <img
                    src={panel.imageUrl}
                    alt={`Panel ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="print:hidden"
          >
            Export as PDF
          </Button>
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

export default ComicLayout;
