<template>
  <div class="content">
    <el-row justify="end">
      <div class="menu">
        <el-tooltip content="帮助">
          <Icon icon="ph:question" class="icon" @click="tourOpen = true" />
        </el-tooltip>
        <el-tour v-model="tourOpen">
          <el-tour-step :target="githubRef?.$el" title="GitHub登录">
            <el-row>
              <el-text>1.显示当前GitHub账号的登录状态</el-text>
            </el-row>
            <el-row>
              <el-text>2.登录按钮进行登录，登录后可查看公司（职位）评论</el-text>
            </el-row>
            <el-row>
              <el-text>3.登出按钮进行登出，清除本地保存的token信息</el-text>
            </el-row>
          </el-tour-step>
          <el-tour-step :target="githubAppRef?.$el" title="GitHub App">
            <el-row>
              <el-text>1.安装GitHub App，跳转到GitHub App安装页面，授权后获得添加评论的能力</el-text>
            </el-row>
            <el-row>
              <el-text>2.如果已安装，则会跳转到GitHub App配置页面</el-text>
            </el-row>
          </el-tour-step>
          <el-tour-step :target="databaseRef?.$el" title="数据库">
            <el-row>
              <el-text>1.数据库备份，将程序的数据库(sqlite)文件压缩成zip后，以下载文件的方式呈现</el-text>
            </el-row>
            <el-row>
              <el-text>2.数据库恢复，接受程序备份的数据库(sqlite)文件，执行恢复后程序的数据将被覆盖</el-text>
            </el-row>
          </el-tour-step>
          <el-tour-step :target="companyRef?.$el" title="公司数据">
            <el-row>
              <el-text>1.全量公司数据导出，将全部公司数据导出成excel文件，以下载文件的方式呈现</el-text>
            </el-row>
            <el-row>
              <el-text>2.公司数据导入，接受程序导出的公司数据excel文件或符合格式的excel文件，执行导入后，相同公司的数据会被覆盖</el-text>
            </el-row>
          </el-tour-step>
          <el-tour-step :target="companyTagRef?.$el" title="公司标签数据">
            <el-row>
              <el-text>1.全量公司标签数据导出，将全部公司标签数据导出成excel文件，以下载文件的方式呈现</el-text>
            </el-row>
            <el-row>
              <el-text>2.公司标签数据导入，接受程序导出的公司标签数据excel文件或符合格式的excel文件，执行导入后，相同公司的数据会被覆盖</el-text>
            </el-row>
          </el-tour-step>
          <el-tour-step :target="infoRef?.$el" title="程序信息">
            <el-row>
              <el-text>显示程序的版本和其他操作</el-text>
            </el-row>
          </el-tour-step>
        </el-tour>
      </div>
    </el-row>
    <el-row ref="githubRef" class="setting_item">
      <el-descriptions title="GitHub登录">
        <el-descriptions-item>
          <div class="loginStatus">
            <div v-if="login">
              <el-avatar :size="50" :src="avatar" />
            </div>
            <div>
              <div>
                <el-text v-if="login">{{ username }}</el-text>
              </div>
              <div>
                <el-text>登录状态：</el-text>
                <el-text v-if="login" type="success">在线</el-text>
                <el-text v-else type="warning">离线</el-text>
              </div>
            </div>
          </div>
          <el-button v-if="!login" @click="onClickLogin">
            <el-icon class="el-icon--left">
              <Icon icon="mdi:github" />
            </el-icon>
            登录</el-button>
          <el-popconfirm v-else title="确定登出？" @confirm="onClickLogout" confirm-button-text="确定" cancel-button-text="取消">
            <template #reference>
              <el-button>
                <el-icon class="el-icon--left">
                  <Icon icon="mdi:github" />
                </el-icon>
                登出</el-button>
            </template>
          </el-popconfirm>
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <el-row ref="githubAppRef" class="setting_item">
      <el-descriptions title="GitHub App">
        <el-descriptions-item>
          <el-tooltip v-if="login" content="安装GitHub App获得添加评论的能力" placement="top">
            <el-button @click="onClickInstallAndLogin">
              <el-icon class="el-icon--left">
                <Icon icon="mdi:github" />
              </el-icon>
              安装GitHubApp获得评论能力<el-icon class="el-icon--left">
                <Icon icon="ph:question" />
              </el-icon></el-button>
          </el-tooltip>
          <el-tooltip v-if="!login" content="安装GitHub App获得添加评论的能力" placement="top">
            <el-button @click="onClickInstallAndLogin">
              <el-icon class="el-icon--left">
                <Icon icon="mdi:github" />
              </el-icon>
              安装GitHubApp并登录<el-icon class="el-icon--left">
                <Icon icon="ph:question" />
              </el-icon></el-button>
          </el-tooltip>
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <el-row ref="databaseRef" class="setting_item">
      <el-descriptions title="数据库">
        <el-descriptions-item>
          <el-popconfirm title="确认备份数据？" @confirm="onClickDbExport" confirm-button-text="确定" cancel-button-text="取消">
            <template #reference>
              <el-button :icon="DocumentCopy" v-loading="exportLoading">数据库备份</el-button>
            </template>
          </el-popconfirm>
          <el-button :icon="CopyDocument" @click="importDialogVisible = true">数据库恢复</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <el-row ref="companyRef" class="setting_item">
      <el-descriptions title="公司数据">
        <el-descriptions-item>
          <el-popconfirm title="确认导出数据？" @confirm="onCompanyExport" confirm-button-text="确定" cancel-button-text="取消">
            <template #reference>
              <el-button :icon="DocumentCopy">全量公司数据导出</el-button>
            </template>
          </el-popconfirm>
          <el-button :icon="CopyDocument" @click="importCompanyDialogVisible = true">公司数据导入</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <el-row ref="companyTagRef" class="setting_item">
      <el-descriptions title="公司标签数据">
        <el-descriptions-item>
          <el-popconfirm title="确认导出数据？" @confirm="onCompanyTagExport" confirm-button-text="确定" cancel-button-text="取消">
            <template #reference>
              <el-button :icon="DocumentCopy">全量公司标签数据导出</el-button>
            </template>
          </el-popconfirm>
          <el-button :icon="CopyDocument" @click="importCompanyTagDialogVisible = true">公司标签数据导入</el-button>
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
    <el-row ref="infoRef" class="setting_item">
      <el-descriptions title="程序信息">
        <el-descriptions-item>
          <el-row>
            <el-col>
              <el-text type="primary" size="large">版本 {{ version }}</el-text>
              <el-text v-if="!newVersion" class="checkingVersion" @click="onCheckVersion" type="info">({{
                checkingVersionText }})</el-text>
              <span v-if="!versionChecking">
                <span v-if="newVersion">
                  <el-text class="newVersion" type="warning">(发现新版本[{{
                    latestVersion }}]({{ dayjs(latestVersionCreatedAt).format("YYYY-MM-DD") }}))</el-text>
                  <el-button @click="latestChangelogDialogVisible = true" type="primary" plain>
                    <el-icon class="el-icon--left">
                      <Icon icon="mdi:note" />
                    </el-icon>
                    查看新版本详情
                  </el-button>
                  <el-button @click="onDownloadLatest" type="primary" plain>
                    <el-icon class="el-icon--left">
                      <Icon icon="mdi:download" />
                    </el-icon>下载新版本
                  </el-button>
                  <el-text v-if="!newVersion" type="success">(已是最新版本)</el-text>
                </span>
              </span>
            </el-col>
            <el-col class="appInfoOperation">
              <el-button @click="updateAppDialogVisible = true">
                如何更新程序版本<el-icon class="el-icon--right">
                  <Icon icon="ph:question" />
                </el-icon>
              </el-button>
              <el-button @click="changelogDialogVisible = true">
                版本说明
              </el-button>
              <el-button @click="licenseDialogVisible = true">
                许可证
              </el-button>
              <el-button @click="onAccessHomePage">访问主页</el-button>
              <el-button @click="onAccessIssuesPage">
                问题反馈
              </el-button>
            </el-col>
          </el-row>
        </el-descriptions-item>
      </el-descriptions>
    </el-row>
  </div>
  <el-dialog v-model="importDialogVisible" title="数据恢复" width="500">
    <div>
      <el-text class="mx-1" type="danger">注意：原数据会被清除!!!</el-text>
    </div>
    <div>
      <el-text class="mx-1" type="info">请选择备份文件</el-text>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-row>
          <input type="file" accept=".zip" ref="importFileInput" @change="handleFileImport" />
        </el-row>
        <el-row class="dialog_menu">
          <el-button type="primary" @click="confirmFileImport">
            确定
          </el-button>
        </el-row>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="reloadDialogVisible" title="数据恢复成功" width="500" :close-on-click-modal="false"
    :close-on-press-escape="false" :show-close="false">
    <span>点击确定按钮重启程序</span>
    <template #footer>
      <el-row class="dialog_menu">
        <el-button type="primary" @click="reloadExtension"> 确定 </el-button>
      </el-row>
    </template>
  </el-dialog>
  <el-dialog v-model="importCompanyDialogVisible" title="公司数据导入" width="500">
    <div>
      <el-text class="mx-1" type="danger">注意：相同公司的数据会被替换!!!</el-text>
    </div>
    <div>
      <el-text class="mx-1" type="info">请选择公司备份文件</el-text>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-row>
          <input type="file" accept=".xlsx" ref="importCompanyFileInput" @change="handleCompanyFileImport" />
        </el-row>
        <el-row class="dialog_menu">
          <el-button type="primary" @click="confirmCompanyFileImport">
            确定
          </el-button>
        </el-row>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="importCompanyTagDialogVisible" title="公司标签数据导入" width="500">
    <div>
      <el-text class="mx-1" type="danger">注意：相同公司的数据会被替换!!!</el-text>
    </div>
    <div>
      <el-text class="mx-1" type="info">请选择公司标签备份文件</el-text>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-row>
          <input type="file" accept=".xlsx" ref="importCompanyTagFileInput" @change="handleCompanyTagFileImport" />
        </el-row>
        <el-row class="dialog_menu">
          <el-button type="primary" @click="confirmCompanyTagFileImport">
            确定
          </el-button>
        </el-row>
      </div>
    </template>
  </el-dialog>
  <el-dialog v-model="updateAppDialogVisible" title="如何更新程序版本" width="800">
    <div>
      <el-text>1.下载新版本程序安装文件（zip格式文件）</el-text>
    </div>
    <div>
      <el-text>2.解压程序安装文件</el-text>
    </div>
    <div>
      <el-text>3.访问 chrome://extensions/ 地址，点击加载已解压的扩展程序，选择解压后 manifest.json 文件所在的目录</el-text>
    </div>
    <div>
      <el-text>4.ID为【{{APP_ID}}】的程序版本为新版本，即更新成功</el-text>
    </div>
  </el-dialog>
  <el-dialog v-model="changelogDialogVisible" title="版本说明" width="800">
    <div v-html="changelogContentHtml"></div>
  </el-dialog>
  <el-dialog v-model="licenseDialogVisible" title="许可证" width="800">
    <div v-html="licenseContent"></div>
  </el-dialog>
  <el-dialog v-model="latestChangelogDialogVisible" title="版本更新详情" width="800">
    <div v-html="latestChangelogContent"></div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import { dbExport, dbImport } from "../../common/api/common";
import { base64ToBytes, bytesToBase64 } from "../../common/utils/base64.js";
import { ElMessage, ElLoading } from "element-plus";
import { DocumentCopy, CopyDocument } from "@element-plus/icons-vue";
import { utils, writeFileXLSX, read } from "xlsx";
import { CompanyApi, AuthApi, UserApi } from "../../common/api/index";
import { SearchCompanyTagBO } from "../../common/data/bo/searchCompanyTagBO";
import { CompanyTagBO } from "../../common/data/bo/companyTagBO";
import { SearchCompanyBO } from "../../common/data/bo/searchCompanyBO";
import { CompanyBO } from "../../common/data/bo/companyBO";
import { genIdFromText, convertDateStringToDateObject } from "../../common/utils";
import { Icon } from '@iconify/vue';
import { marked } from "marked";
import { APP_URL_LATEST_VERSION,APP_ID } from "../../common/config";
import semver from "semver";

const activeName = ref("export");
const exportLoading = ref(false);
const importDialogVisible = ref(false);
const importFileInput = ref<HTMLInputElement | null>(null);
const files = ref();
const reloadDialogVisible = ref(false);

const handleFileImport = async () => {
  files.value = importFileInput.value?.files;
};

const reloadExtension = async () => {
  chrome.runtime.reload();
};

const confirmFileImport = async () => {
  let loading;
  try {
    if (files.value && files.value.length > 0) {
      loading = ElLoading.service({
        lock: true,
        text: "数据恢复中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      const reader = new FileReader();
      reader.readAsArrayBuffer(files.value[0]);
      reader.onload = async function (event) {
        let arrayBuffer = event.target.result;
        try {
          let base64String = bytesToBase64(
            new Uint8Array(arrayBuffer as ArrayBuffer)
          );
          await dbImport(base64String);
          importDialogVisible.value = false;
          reloadDialogVisible.value = true;
        } catch (e) {
          ElMessage({
            message: "恢复备份文件失败[" + e.message + "]",
            type: "error",
          });
        }
      };
      reader.onerror = function (event) {
        ElMessage({
          message: "读取备份文件失败",
          type: "error",
        });
      };
    } else {
      ElMessage("请选择有效的备份文件");
    }
  } finally {
    if (loading) {
      loading.close();
    }
  }
};

const onClickDbExport = async () => {
  let result = await dbExport();
  exportLoading.value = true;
  try {
    downloadBlob(
      base64ToBytes(result),
      dayjs(new Date()).format("YYYYMMDDHHmmss") + ".zip",
      "application/octet-stream"
    );
  } finally {
    exportLoading.value = false;
  }
};

const downloadBlob = function (data, fileName, mimeType) {
  let blob, url;
  blob = new Blob([data], {
    type: mimeType,
  });
  url = window.URL.createObjectURL(blob);
  downloadURL(url, fileName);
  setTimeout(function () {
    return window.URL.revokeObjectURL(url);
  }, 1000);
};

const downloadURL = function (data, fileName) {
  let a;
  a = document.createElement("a");
  a.href = data;
  a.download = fileName;
  document.body.appendChild(a);
  a.style = "display: none";
  a.click();
  a.remove();
};

//10 million
const MAX_RECORD_COUNT = 10000000;

const onCompanyExport = async () => {
  let searchParam = new SearchCompanyBO();
  searchParam.pageNum = 1;
  searchParam.pageSize = MAX_RECORD_COUNT;
  searchParam.orderByColumn = "updateDatetime";
  searchParam.orderBy = "DESC";
  let data = await CompanyApi.searchCompany(searchParam);
  let list = data.items;
  let result = [];
  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    result.push({
      公司: item.companyName,
      公司描述: item.companyDesc,
      成立时间: item.companyStartDate,
      经营状态: item.companyStatus,
      法人: item.companyLegalPerson,
      统一社会信用代码: item.companyUnifiedCode,
      官网: item.companyWebSite,
      社保人数: item.companyInsuranceNum,
      自身风险数: item.companySelfRisk,
      关联风险数: item.companyUnionRisk,
      地址: item.companyAddress,
      经营范围: item.companyScope,
      纳税人识别号: item.companyTaxNo,
      所属行业: item.companyIndustry,
      工商注册号: item.companyLicenseNumber,
      经度: item.companyLongitude,
      纬度: item.companyLatitude,
      数据来源地址: item.sourceUrl,
      数据来源平台: item.sourcePlatform,
      数据来源记录编号: item.sourceRecordId,
      数据来源更新时间: item.sourceRefreshDatetime,
    });
  }
  const ws = utils.json_to_sheet(result);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Data");
  writeFileXLSX(wb, dayjs(new Date()).format("公司-YYYYMMDDHHmmss") + ".xlsx");
}

const importCompanyDialogVisible = ref(false);
const importCompanyFileInput = ref<HTMLInputElement | null>(null);
const companyFiles = ref();

const handleCompanyFileImport = async () => {
  companyFiles.value = importCompanyFileInput.value?.files;
};

const confirmCompanyFileImport = async () => {
  let loading;
  try {
    if (companyFiles.value && companyFiles.value.length > 0) {
      loading = ElLoading.service({
        lock: true,
        text: "公司数据导入中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      const reader = new FileReader();
      reader.readAsArrayBuffer(companyFiles.value[0]);
      reader.onload = async function (event) {
        let arrayBuffer = event.target.result;
        try {
          let wb = read(arrayBuffer);
          let validResultObject = validImportData(utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }), COMPANY_FILE_HEADER);
          if (!validResultObject.validResult) {
            ElMessage({
              message: `公司文件校验失败，缺少数据列(${validResultObject.lackColumn.length}):${validResultObject.lackColumn.join(",")}`,
              type: "error",
            });
            return;
          }
          const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 2 });
          let companyBOList = [];
          for (let i = 0; i < data.length; i++) {
            let dataItem = data[i];
            let item = new CompanyBO();
            item.companyId = genIdFromText(dataItem['公司']);
            item.companyName = dataItem['公司'];
            item.companyDesc = dataItem['公司描述'];
            item.companyStartDate = convertDateStringToDateObject(dataItem['成立时间']);
            item.companyStatus = dataItem['经营状态'];
            item.companyLegalPerson = dataItem['法人'];
            item.companyUnifiedCode = dataItem['统一社会信用代码'];
            item.companyWebSite = dataItem['官网'];
            item.companyInsuranceNum = dataItem['社保人数'];
            item.companySelfRisk = dataItem['自身风险数'];
            item.companyUnionRisk = dataItem['关联风险数'];
            item.companyAddress = dataItem['地址'];
            item.companyScope = dataItem['经营范围'];
            item.companyTaxNo = dataItem['纳税人识别号'];
            item.companyIndustry = dataItem['所属行业'];
            item.companyLicenseNumber = dataItem['工商注册号'];
            item.companyLongitude = dataItem['经度'];
            item.companyLatitude = dataItem['纬度'];
            item.sourceUrl = dataItem['数据来源地址'];
            item.sourcePlatform = dataItem['数据来源平台'];
            item.sourceRecordId = dataItem['数据来源记录编号'];
            item.sourceRefreshDatetime = convertDateStringToDateObject(dataItem['数据来源更新时间']);
            companyBOList.push(item);
          }
          await CompanyApi.batchAddOrUpdateCompany(companyBOList);
          importCompanyDialogVisible.value = false;
          ElMessage({
            message: `导入公司数据成功，共${companyBOList.length}条`,
            type: "success",
          });
        } catch (e) {
          ElMessage({
            message: "导入公司数据失败[" + e.message + "]",
            type: "error",
          });
        }
      };
      reader.onerror = function (event) {
        ElMessage({
          message: "读取公司文件失败",
          type: "error",
        });
      };
    } else {
      ElMessage("请选择有效的公司文件");
    }
  } finally {
    if (loading) {
      loading.close();
    }
  }
};

const COMPANY_FILE_HEADER = [
  "公司",
  "公司描述",
  "成立时间",
  "经营状态",
  "法人",
  "统一社会信用代码",
  "官网",
  "社保人数",
  "自身风险数",
  "关联风险数",
  "地址",
  "经营范围",
  "纳税人识别号",
  "所属行业",
  "工商注册号",
  "经度",
  "纬度",
  "数据来源地址",
  "数据来源平台",
  "数据来源记录编号",
  "数据来源更新时间",
];

function validImportData(data, validArray) {
  let colCount = 0;
  let lackColumnMap = new Map();
  for (let i = 0; i < validArray.length; i++) {
    lackColumnMap.set(validArray[i], null);
  }
  if (data.length > 0) {
    let headerRowArray = data[0];
    for (let i = 0; i < headerRowArray.length; i++) {
      let header = headerRowArray[i];
      if (lackColumnMap.has(header)) {
        colCount++;
        lackColumnMap.delete(header);
      }
    }
  }
  return { validResult: colCount == validArray.length, lackColumn: lackColumnMap.keys().toArray() };
}

const onCompanyTagExport = async () => {
  let searchParam = new SearchCompanyTagBO();
  searchParam.pageNum = 1;
  searchParam.pageSize = MAX_RECORD_COUNT;
  searchParam.orderByColumn = "updateDatetime";
  searchParam.orderBy = "DESC";
  let data = await CompanyApi.searchCompanyTag(searchParam);
  let list = data.items;
  let result = [];
  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    result.push({
      公司: item.companyName,
      标签: item.tagNameArray.join(","),
    });
  }
  const ws = utils.json_to_sheet(result);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Data");
  writeFileXLSX(wb, dayjs(new Date()).format("公司标签-YYYYMMDDHHmmss") + ".xlsx");
}

const importCompanyTagDialogVisible = ref(false);
const importCompanyTagFileInput = ref<HTMLInputElement | null>(null);
const companyTagFiles = ref();

const handleCompanyTagFileImport = async () => {
  companyTagFiles.value = importCompanyTagFileInput.value?.files;
};

const COMPANY_TAG_FILE_HEADER = [
  "公司",
  "标签",
];

const confirmCompanyTagFileImport = async () => {
  let loading;
  try {
    if (companyTagFiles.value && companyTagFiles.value.length > 0) {
      loading = ElLoading.service({
        lock: true,
        text: "公司标签数据导入中...",
        background: "rgba(0, 0, 0, 0.7)",
      });
      const reader = new FileReader();
      reader.readAsArrayBuffer(companyTagFiles.value[0]);
      reader.onload = async function (event) {
        let arrayBuffer = event.target.result;
        try {
          let wb = read(arrayBuffer);
          let validResultObject = validImportData(utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }), COMPANY_TAG_FILE_HEADER);
          if (!validResultObject.validResult) {
            ElMessage({
              message: `公司标签文件校验失败，缺少数据列(${validResultObject.lackColumn.length}):${validResultObject.lackColumn.join(",")}`,
              type: "error",
            });
            return;
          }
          const data = utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 2 });
          let companyTagBOList = [];
          for (let i = 0; i < data.length; i++) {
            let dataItem = data[i];
            let item = new CompanyTagBO();
            item.companyName = dataItem['公司'];
            item.tags = (dataItem['标签'] as string).split(",");
            companyTagBOList.push(item);
          }
          await CompanyApi.batchAddOrUpdateCompanyTag(companyTagBOList);
          importCompanyTagDialogVisible.value = false;
          ElMessage({
            message: `导入公司标签数据成功，共${companyTagBOList.length}条`,
            type: "success",
          });
        } catch (e) {
          ElMessage({
            message: "导入公司标签数据失败[" + e.message + "]",
            type: "error",
          });
        }
      };
      reader.onerror = function (event) {
        ElMessage({
          message: "读取公司标签文件失败",
          type: "error",
        });
      };
    } else {
      ElMessage("请选择有效的公司标签文件");
    }
  } finally {
    if (loading) {
      loading.close();
    }
  }
};

const login = ref(false);
const username = ref("");
const avatar = ref("");

const onClickLogin = async () => {
  await AuthApi.authOauth2Login();
  await checkLoginStatus();
}

const onClickInstallAndLogin = async () => {
  await AuthApi.authInstallAndLogin();
  await checkLoginStatus();
}

const onClickLogout = async () => {
  await AuthApi.authSetToken(null);
  await UserApi.userSet(null);
  await checkLoginStatus()
}

const checkLoginStatus = async () => {
  let oauthDTO = await AuthApi.authGetToken();
  if (oauthDTO) {
    login.value = true;
  } else {
    login.value = false;
  }
  let userDTO = await UserApi.userGet();
  if (userDTO) {
    username.value = userDTO.login;
    avatar.value = userDTO.avatarUrl;
  }
}

const githubRef = ref();
const githubAppRef = ref();
const databaseRef = ref();
const companyRef = ref();
const companyTagRef = ref();
const infoRef = ref();

const tourOpen = ref(false);

const changelogDialogVisible = ref(false);
const changelogContentHtml = ref("");

const version = __APP_VERSION__;
const homepage = ref();
const bugs = ref();

const licenseDialogVisible = ref(false);
const licenseContent = ref();
const newVersion = ref(false);

const versionChecking = ref(true);
const latestVersion = ref();
const versionObject = ref();
const latestVersionCreatedAt = ref();
const checkingVersionText = ref("正检查新版本");
const latestChangelogDialogVisible = ref(false);
const latestChangelogContent = ref();
const updateAppDialogVisible = ref(false);

onMounted(async () => {
  await checkLoginStatus()
  let changelogUrl = chrome.runtime.getURL("CHANGELOG.md");
  let changelogContent = await (await fetch(changelogUrl)).text();
  changelogContentHtml.value = marked.parse(changelogContent);
  let packageUrl = chrome.runtime.getURL("package.json");
  let packageObject = await (await fetch(packageUrl)).json();
  homepage.value = packageObject.homepage;
  bugs.value = packageObject.bugs;
  let licenseUrl = chrome.runtime.getURL("LICENSE");
  let licenseContentFromFile = await (await fetch(licenseUrl)).text();
  licenseContent.value = marked.parse(licenseContentFromFile);
  onCheckVersion();
})

const onCheckVersion = async () => {
  versionChecking.value = true;
  checkingVersionText.value = "正检查新版本"
  try {
    await checkVersion();
    checkingVersionText.value = "已是最新版本，点击再检查"
    versionChecking.value = false;
  } catch (e) {
    checkingVersionText.value = "版本检查失败，请点击再次检查"
  }
}

const checkVersion = async () => {
  try {
    versionObject.value = await (await fetch(APP_URL_LATEST_VERSION)).json();
    latestVersion.value = versionObject.value.tag_name;
    newVersion.value = semver.gt(latestVersion.value, version);
    latestVersionCreatedAt.value = versionObject.value.created_at;
    latestChangelogContent.value = marked.parse(versionObject.value.body);
  } catch (e) {
    throw e;
  }
}

const onDownloadLatest = async () => {
  let assets = getLatestAssets();
  let url = assets?.browser_download_url;
  if (url) {
    window.open(url);
  } else {
    ElMessage('未找到安装文件');
  }
}

const getLatestAssets = () => {
  let assets = versionObject.value.assets;
  let targetUrl = null;
  let chromeZipAssets = assets.filter(item => { return item.name.includes("chrome") && item.name.endsWith(".zip") });
  if (chromeZipAssets && chromeZipAssets.length > 0) {
    return chromeZipAssets[0];
  } else {
    return null;
  }
}

const onAccessHomePage = () => {
  window.open(homepage.value);
}

const onAccessIssuesPage = () => {
  window.open(bugs.value);
}

</script>
<style lang="scss">
.setting_item {
  padding: 5px;
}

.dialog_menu {
  justify-content: end;
}

.appInfoOperation {
  margin-top: 10px;
}

.loginStatus {
  display: inline-flex;
  margin-right: 5px;
}

.menu {
  padding: 5px;
}

.icon {
  cursor: pointer;
  width: 24px;
  height: 24px;
}

.checkingVersion {
  cursor: pointer;
}

.newVersion {
  
}

.latestVersionChangelogDetailButton {
  cursor: pointer;
}

.content {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: scroll;
}
</style>