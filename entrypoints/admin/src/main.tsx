import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initBridge } from "@/common/api/common";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import 'dayjs/locale/zh-cn';

async function init() {
  await initBridge();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ConfigProvider locale={zhCN}>
        <App />
      </ConfigProvider>
    </StrictMode>
  );
}
init();
