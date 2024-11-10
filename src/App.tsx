// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PromptPage from "./components/PromptPage";
import PanelsPage from "./components/panels/PanelPage";
import ApiKeyPage from "./components/ApiKeyPage";
import ComicLayout from "./components/comic/ComicLayout";
import LayoutGeneratorPage from "./components/layout-generator/LayoutGeneratorPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<PromptPage />} />
          <Route path="/panels" element={<PanelsPage />} />
          <Route path="/settings" element={<ApiKeyPage />} />
          <Route path="/comic" element={<ComicLayout />} />
          <Route path="/layout" element={<LayoutGeneratorPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
