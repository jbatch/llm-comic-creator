// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PromptPage from "./components/prompt/PromptPage";
import PanelsPage from "./components/panels/PanelPage";
import ApiKeyPage from "./components/ApiKeyPage";
import ComicLayout from "./components/comic/ComicLayout";
import ComicLayoutV2 from "./components/comic/ComicLayoutV2";
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
          <Route path="/comic2" element={<ComicLayoutV2 />} />
          <Route path="/layout" element={<LayoutGeneratorPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
