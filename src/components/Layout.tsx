// src/components/Layout.tsx
import { Outlet } from "react-router-dom";
import DevToolbar from "./DevToolbar";
import { Toaster } from "./ui/toaster";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Story Generator</h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Created with Vite and shadcn/ui
          </p>
        </div>
      </footer>
      <DevToolbar />
      <Toaster />
    </div>
  );
};

export default Layout;
