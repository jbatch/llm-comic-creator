import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const PanelBreadcrumb: React.FC = () => (
  <nav className="bg-white border-b">
    <div className="max-w-7xl mx-auto px-4 py-3">
      <div className="flex items-center space-x-2 text-sm">
        <Link to="/" className="text-gray-500 hover:text-gray-700">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-500" />
        <Link to="/" className="text-gray-500 hover:text-gray-700">
          Story
        </Link>
        <ChevronRight className="h-4 w-4 text-gray-500" />
        <span className="text-gray-900 font-medium">Panels</span>
      </div>
    </div>
  </nav>
);

export default PanelBreadcrumb;
