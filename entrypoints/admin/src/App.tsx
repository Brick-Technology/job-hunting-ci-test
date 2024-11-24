import React from "react";
import { HashRouter, Route, Routes } from "react-router";
import "./App.css";
import RootLayout from "./RootLayout";
import AssistantView from "./pages/AssistantView";
import BbsView from "./pages/BbsView";
import DashboardView from "./pages/DashboardView";
import DataSharePlanView from "./pages/DataSharePlanView";
import SettingView from "./pages/SettingView";
import CompanyTagView from "./pages/data/CompanyTagView";
import CompanyView from "./pages/data/CompanyView";
import JobTagView from "./pages/data/JobTagView";
import JobView from "./pages/data/JobView";

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="assistant" element={<AssistantView />} />
          <Route path="bbs" element={<BbsView />} />
          <Route path="job" element={<JobView />} />
          <Route path="company" element={<CompanyView />} />
          <Route path="jobTag" element={<JobTagView />} />
          <Route path="companyTag" element={<CompanyTagView />} />
          <Route path="dataSharePlan" element={<DataSharePlanView />} />
          <Route path="setting" element={<SettingView />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
