import react from "@vitejs/plugin-react-swc";
import { copyFileSync } from "fs";
import { resolve } from "path";
import wasm from "vite-plugin-wasm";
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/unocss','@wxt-dev/module-react'],
  unocss: {
    configOrPath: {
      // mode: 'shadow-dom',
    }
  },
  manifest: {
    action: {
      default_title: "Click to open admin page"
    },
    content_security_policy: { "extension_pages": "script-src 'self' 'wasm-unsafe-eval'" },
    "web_accessible_resources": [
      {
        "resources": [
          "proxyAjax.js",
          "CHANGELOG.md",
          "package.json",
          "LICENSE"
        ],
        "matches": [
          "https://www.zhipin.com/*",
          "https://www.zhaopin.com/*",
          "https://we.51job.com/*",
          "https://www.lagou.com/*",
          "https://hk.jobsdb.com/*",
          "https://www.liepin.com/*",
          "https://aiqicha.baidu.com/*"
        ]
      }
    ],
    permissions: [
      "webRequest",
      "offscreen",
      "unlimitedStorage",
      "declarativeNetRequestWithHostAccess",
      "declarativeNetRequestFeedback",
      "debugger"
    ],
    "host_permissions": [
      "http://*/",
      "https://*/"
    ],
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4sziiWIatNirncnJmxcaJVqmDELP+eQo4C1ZYCCgGJEkAEgDlZpIlKuPS5JRe1h91vo9kPmivK833Trrm1tQtfoaCNxo+oFGTJfYJxKDWE82cMbM1gWsL7HkeiU7nJ7U2EBDA1hKT2TkGO0k5JVwgPpvaOomAFfB9/14hcPwYuDf/3eeRRTzLDK/LpCbt821jmrPlOZ9jgk0MPNxJ7BnZf5e6rG90sOdClhe8EYB/7ysXKv0uiYiJdbOLbmWC1WfmabIvJL2SoUAdBQJf4HWgZ+ZmxMwgWoAikrbBr0Hug+xDTFgiTJCNCOIbma0M1f7Sf7SP55vcbr1FMsoRfifowIDAQAB"
  },
  hooks: {
    'build:done'(wxt, output) {
      let srcDir = wxt.config.srcDir;
      let outDir = wxt.config.outDir;
      const changelogName = "CHANGELOG.md";
      const packageName = "package.json";
      const licenseName = "LICENSE";
      copyFileSync(resolve(srcDir, changelogName), resolve(outDir, changelogName));
      copyFileSync(resolve(srcDir, packageName), resolve(outDir, packageName));
      copyFileSync(resolve(srcDir, licenseName), resolve(outDir, licenseName));
      if (wxt.config.mode == 'production') {
        copyFileSync(resolve(srcDir, "node_modules", "@sqlite.org", "sqlite-wasm", "sqlite-wasm", "jswasm", "sqlite3.wasm"), resolve(outDir, "assets", "sqlite3.wasm"));
        copyFileSync(resolve(srcDir, "node_modules", "@sqlite.org", "sqlite-wasm", "sqlite-wasm", "jswasm", "sqlite3-opfs-async-proxy.js"), resolve(outDir, "assets", "sqlite3-opfs-async-proxy.js"));
      }
    },
  },
  vite: () => {
    return {
      define: {
        __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      },
      build: {
        cssMinify: "lightningcss"
      },
      css: {
        lightningcss: {
        }
      },
      plugins: () => {
        [react(), wasm()]
      },
      worker: {
        plugins: () => [wasm()]
      },
      optimizeDeps: {
        exclude: ['@sqlite.org/sqlite-wasm']
      }
    }
  }
});
