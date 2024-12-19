<p align="center">
    <img width="180" src="docs\logo.svg" alt="Vite logo">
</p>

# Job Hunting(职位猎人) - 一款协助找工作的浏览器插件

[![build](https://github.com/lastsunday/job-hunting/actions/workflows/build.yml/badge.svg)](https://github.com/lastsunday/job-hunting/actions/workflows/build.yml)

## 招聘平台支持列表

| 招聘平台  | 访问地址                            | 备注                   |
| --------- | ----------------------------------- | ---------------------- |
| BOSS 直聘 | <https://www.zhipin.com/web/geek/job> | 搜索页 |
|  | <https://www.zhipin.com/web/geek/job-recommend> | 推荐页 |
| 前程无忧  | <https://we.51job.com/pc/search>      | 搜索页 |
| 智联招聘  | <https://sou.zhaopin.com/>            | 搜索页 |
| 拉钩网    | <https://www.lagou.com/wn/zhaopin>    | 搜索页 |
| jobsdb-hk | <https://hk.jobsdb.com/>              | 搜索页,需点击搜索按钮才有效果 |
| 猎聘网    | <https://www.liepin.com/zhaopin>      | 搜索页,需点击搜索按钮才有效果 |

## 企业搜索平台支持列表

| 企业搜索平台  | 访问地址                            | 备注                   |
| --------- | ----------------------------------- | ---------------------- |
| 爱企查 | <https://aiqicha.baidu.com/s> |                        |

## 功能列表

1. 招聘网站职位卡片

   1. 显示职位发布时间与自动排序(按职位发布时间,hr 活跃时间（只支持 BOSS）)
   2. 快捷查询公司信息 🔎（互联网渠道，政府渠道），自动查询官网可达性，建站时间和备案信息
   3. 自动检测公司风评 📡，当前支持：若比邻黑名单，互联网企业黑名单，IT黑名单，信用中国(北京)黑名单
   4. 自动快速查询公司信息（BOSS 直聘和猎聘网需手动点击查询）
   5. 显示职位初次浏览时间，历史浏览次数，职位详情查看次数
   6. 保存职位数据，公司数据到本地数据库
   7. 职位评论，公司评论
   8. 公司自定义标签，职位自定义标签（可添加，修改），内置外包公司标签数据

2. 爱企查公司卡片

   1. 显示额外信息
   2. 保存公司数据到本地数据库
   3. 公司标签编辑
   4. 公司评论

3. 管理页面

   1. 首页展示招聘网站和企业搜索网站的快捷入口
   2. 数据统计图表
      1. 职位发布时间分析(按月)
      2. 职位发布时间分析(按周)
      3. 职位发布时间分析(按日)
      4. 职位发布时间分析(按小时)
      5. 职位发布平台分析
      6. 公司成立年份分段分析
      7. 公司社保人数分段分析
      8. 数据共享任务（任务执行，数据上传，文件下载，数据合并）
   3. 数据管理页面（职位，公司，标签，职位标签，公司标签），数据导出，导入
      1. 职位（查导）
      2. 公司（查导）
      3. 标签（增删查），标签私密性更改（备注：私有标签不会被上传）
      4. 公司标签（增删改查导）
      5. 职位标签（增删改查导）
   4. 个人助理，设置职位偏好，快速找到感兴趣的职位
   5. 自动化任务，支持自动浏览职位搜索页。（前程无忧，BOSS直聘，智联招聘，拉勾网，猎聘网）
   6. 讨论区板块，根据省市区区分
   7. 数据备份，数据恢复
   8. 数据共享计划
      1. 支持本地数据同步到GitHub仓库
      2. 从其他GitHub仓库同步数据到本地
      3. 管理数据共享计划伙伴列表
      4. 寻找数据共享计划伙伴

## Road Map

- [x] 讨论区
- [x] 个人助理
  - [x] 职位偏好
- [x] 自动浏览职位搜索页（目标：实现自动更新数据）
  - [x] 招聘平台
    - [x] BOSS直聘
    - [x] 前程无忧
    - [x] 智联招聘
    - [x] 拉钩网
    - [x] 猎聘网
- [ ] 数据共享计划
  - [ ] 支持的服务端
    - [ ] <https://github.com/lastsunday/job-hunting-server>
    - [x] GitHub
  - [x] 数据
    - [x] 职位
    - [x] 公司
    - [x] 公司标签
    - [x] 职位标签
  - [x] 数据共享计划伙伴列表
    - [x] 增删改查
    - [x] 寻找伙伴
- [ ] 多语言
  - [ ] 英文
  - [ ] 简体中文
  - [ ] 繁体中文
- [ ] 皮肤
  - [ ] 暗黑模式
- [ ] 开发者模式
  - [ ] 批量删除issues
  - [ ] 流量监控

## Browsers support

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/> Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)<br/>Chrome |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| Edge                                                         | last version                                                 |

## 运行截图

### 招聘/企业信息网站页面

#### 搜索页（前程无忧）

<div style="margin-top:30px">
    <img src="docs\introduction\job-item-51job.jpg" alt="51job" width="1000px"/>
</div>

#### 推荐页（BOSS直聘）

<div style="margin-top:30px">
    <img src="docs\introduction\job-recommend-boss.jpg" alt="51job" width="1000px"/>
</div>

#### 爱企查

<div style="margin-top:30px">
    <img src="docs\introduction\company-aiqicha.jpg" alt="aiqicha" width="1000px"/>
</div>

### 数据共享计划

<div style="margin-top:30px">
    <img src="docs\introduction\chrome_extension_data_share_introduction.png" alt="chrome_extension_data_share_introduction" width="1000px"/>
</div>

<div style="margin-top:30px">
    <img src="docs\introduction\chrome_extension_data_share_statistic.png" alt="chrome_extension_data_share_statistic" width="1000px"/>
</div>

<div style="margin-top:30px">
    <img src="docs\introduction\chrome_extension_data_share_task.png" alt="chrome_extension_data_share_task" width="1000px"/>
</div>

<div style="margin-top:30px">
    <img src="docs\introduction\chrome_extension_data_share_partner.png" alt="chrome_extension_data_share_partner" width="1000px"/>
</div>

### 管理页面

#### 打开管理页面

<div style="margin-top:30px">
    <img src="docs\introduction\chrome_extension_sidepanel_open.png" alt="chrome_extension_sidepanel_open" width="1000px"/>
</div>

#### 管理页面首页（需点击插件图标打开）

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_home.png" alt="sidepanel_admin_home" width="1000px"/>
</div>

#### 个人助理

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_assistant.png" alt="sidepanel_admin_assistant" width="1000px"/>
    <img src="docs\introduction\sidepanel_admin_assistant_favious_setting.png" alt="sidepanel_admin_favious_setting" width="1000px"/>
</div>

#### 自动化

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_auto_mission.png" alt="sidepanel_admin_auto_mission" width="1000px"/>
</div>

#### 讨论区

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_comment.png" alt="sidepanel_admin_comment" width="1000px"/>
</div>

#### 职位

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_job.png" alt="sidepanel_admin_job" width="1000px"/>
</div>

#### 公司管理

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_company.png" alt="sidepanel_admin_company" width="1000px"/>
</div>

#### 公司标签管理

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_company_tag.png" alt="sidepanel_admin_company_tag" width="1000px"/>
</div>

#### 职位标签管理

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_job_tag.png" alt="sidepanel_admin_job_tag" width="1000px"/>
</div>

#### 系统设置

<div style="margin-top:30px">
    <img src="docs\introduction\sidepanel_admin_setting.png" alt="sidepanel_admin_setting" width="1000px"/>
</div>


## 运行及编译

> 以chrome为例

**直接下载 1（尝鲜版）**

1. 切换到 dist/chrome-dev 分支
2. 点击右边绿色 code 按钮，选择下拉框中的 Download ZIP 下载
3. 解压 zip 文件
4. 打开 chrome，选择加载已解压的扩展程序，选择解压后 manifest.json 文件所在的目录

**直接下载 2**

1. 切换到 dist/chrome-xx.xx.xx 分支
2. 点击右边绿色 code 按钮，选择下拉框中的 Download ZIP 下载
3. 解压 zip 文件
4. 打开 chrome，选择加载已解压的扩展程序，选择解压后 manifest.json 文件所在的目录

**直接下载 3**

1. 打开 Release 页
2. 找到最新版本的 Assets 页下的 job-hunting-extension-chrome-xxx.zip
3. 解压 zip 文件
4. 打开 chrome，选择加载已解压的扩展程序，选择解压后 manifest.json 文件所在的目录

**编译**

1. 安装，编译

```bash
    pnpm i
    pnpm run build
```

2. 打开 chrome，选择加载已解压的扩展程序，选择当前项目的 .output/chrome-mv3 目录

3. 打开页面
   - boss 直聘： <https://www.zhipin.com/web/geek/job>
   - 51Job： <https://we.51job.com/pc/search>
   - 智联招聘： <https://sou.zhaopin.com/>
   - 拉钩网：<https://www.lagou.com/wn/zhaopin>
   - jobsdb-hk：<https://hk.jobsdb.com/>
   - 猎聘网： <https://www.liepin.com/zhaopin>

**开发**

1. 安装，编译

   ```bash
   pnpm i
   pnpm run dev
   ```

2. chrome 浏览器打开 chrome://extensions/ 页面

3. 点击`加载已解压的扩展程序`

4. 选择项目中生成的 .output/chrome-mv3 文件夹即可

5. 每次保存都会重新编译，扩展程序需要**_重新点一次刷新按钮_**才生效

## Thanks

1. <https://github.com/tangzhiyao/boss-show-time> **_boss 直聘时间展示插件_**
2. <https://github.com/iibeibei/tampermonkey_scripts> **_BOSS 直聘 跨境黑名单_**
3. <https://kjxb.org/> **_【跨境小白网】，跨境电商人的职场交流社区，互助网站。_**
4. <https://maimai.cn/article/detail?fid=1662335089&efid=I0IjMo8A_37C2pHoqU2HjA> **_求职必备技能：教你如何扒了公司的底裤_**
5. <https://github.com/it-job-blacklist/996ICU.job.blacklist_company> **_主要城市996公司名单，互联网企业黑名单，找工作防止掉坑_**
6. <http://www.blackdir.com> **_IT黑名单_**
7. <https://www.reshot.com> **Free Icons & IllustrationsDesign freely with instant downloads and commercial licenses.**
8. <https://github.com/wxt-dev/wxt> **Next-gen Web Extension Framework**
9. <https://github.com/ant-design/ant-design> **An enterprise-class UI design language and React UI library**
