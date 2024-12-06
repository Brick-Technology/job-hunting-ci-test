import React from "react";
import { HashRouter, Route, Routes } from "react-router";
import { useShallow } from 'zustand/shallow';
import "./App.css";
import RootLayout from "./layout/RootLayout";
import BbsView from "./pages/BbsView";
import DashboardView from "./pages/DashboardView";
import SettingView from "./pages/SettingView";
import AutomateView from "./pages/assistant/AutomateView";
import FavoriteJobView from "./pages/assistant/FavoriteJobView";
import HistoryJobView from "./pages/assistant/HistoryJobView";
import CompanyTagView from "./pages/data/CompanyTagView";
import CompanyView from "./pages/data/CompanyView";
import JobTagView from "./pages/data/JobTagView";
import JobView from "./pages/data/JobView";
import PartnerView from "./pages/dataSharePlan/PartnerView";
import DataSharePlanStatisticView from "./pages/dataSharePlan/StatisticView";
import TaskView from "./pages/dataSharePlan/TaskView";
import DataSharePlanWelcomeView from "./pages/dataSharePlan/WelcomeView";
import useAuthStore from "./store/AuthStore";
import useDataSharePlanStore from "./store/DataSharePlanStore";


const App: React.FC = () => {

  const [init, setInit] = useState(false);

  const [authStoreInit] = useAuthStore(useShallow(((state) => [
    state.init,
  ])));
  const [dataSharePlanStoreInit] = useDataSharePlanStore(useShallow(((state) => [
    state.init,
  ])));

  useEffect(() => {
    const initStore = async () => {
      await authStoreInit();
      await dataSharePlanStoreInit();
      setInit(true);
      document.getElementById("loading")?.remove()
    }
    initStore();
  }, [])
  return (
    init ? <HashRouter>
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
          <Route path="dataSharePlanWelcome" element={<DataSharePlanWelcomeView />} />
          <Route path="dataSharePlanStatistic" element={<DataSharePlanStatisticView />} />
          <Route path="task" element={<TaskView />} />
          <Route path="partner" element={<PartnerView />} />
          <Route path="setting" element={<SettingView />} />
          <Route path="*" element={<DashboardView />} />
        </Route>
      </Routes>
    </HashRouter> : null
  );
};

export default App;
