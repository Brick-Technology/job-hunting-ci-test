import React from "react";
import { HashRouter, Route, Routes } from "react-router";
import "./App.css";
import RootLayout from "./RootLayout";
import BbsView from "./pages/BbsView";
import DashboardView from "./pages/DashboardView";
import DataSharePlanView from "./pages/DataSharePlanView";
import SettingView from "./pages/SettingView";
import FavoriteJobView from "./pages/assistant/FavoriteJobView";
import CompanyTagView from "./pages/data/CompanyTagView";
import CompanyView from "./pages/data/CompanyView";
import JobTagView from "./pages/data/JobTagView";
import JobView from "./pages/data/JobView";
import HistoryJobView from "./pages/assistant/HistoryJobView";
import AutomateView from "./pages/assistant/AutomateView";

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<DashboardView />} />
          <Route path="favoriteJob" element={<FavoriteJobView />} />
          <Route path="historyJob" element={<HistoryJobView />} />
          <Route path="automate" element={<AutomateView />} />
          <Route path="bbs" element={<BbsView />} />
          <Route path="job" element={<JobView />} />
          <Route path="company" element={<CompanyView />} />
          <Route path="jobTag" element={<JobTagView />} />
          <Route path="companyTag" element={<CompanyTagView />} />
          <Route path="dataSharePlan" element={<DataSharePlanView />} />
          <Route path="setting" element={<SettingView />} />
          <Route path="*" element={<DashboardView />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;
