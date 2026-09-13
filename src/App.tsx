import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CasesPage } from "./pages/CasesPage";
import { HomePage } from "./pages/HomePage";
import { LearningPage } from "./pages/LearningPage";
import { MyPolicyPage } from "./pages/MyPolicyPage";
import { SimulationPage } from "./pages/SimulationPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cases" element={<CasesPage />} />
        <Route path="/simulate/:caseId" element={<SimulationPage />} />
        <Route path="/simulate" element={<Navigate to="/cases" replace />} />
        <Route path="/my-policy" element={<MyPolicyPage />} />
        <Route path="/learn" element={<LearningPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
