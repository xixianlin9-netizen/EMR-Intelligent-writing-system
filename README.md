# emr-system

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## 项目 README.md

# 电子病历智能书写系统 (EMR Smart Writing System)

一个基于 Vue 3 开发的智能电子病历前端系统，支持门诊/住院双模式切换、结构化病历书写、多源临床数据引用、智能质控评分和草稿自动保存等功能。

## 📋 项目简介

本项目是一个面向临床医生的智能电子病历前端原型系统，旨在解决传统电子病历系统中存在的重复录入、数据引用繁琐、易丢失内容等问题。系统通过组件化架构实现结构化字段与富文本的协同编辑，支持从医嘱、检验结果、影像报告等多源数据中智能引用内容，并提供本地自动保存机制。

系统支持**门诊模式**和**住院模式**双模式切换，不同模式下患者列表字段、统计卡片、告警规则均有所不同，满足不同临床场景需求。

## ✨ 功能特性

### 1. 用户认证
- 登录/登出功能
- 本地用户注册（支持演示环境）
- 记住登录状态

### 2. 门诊/住院双模式
- **门诊模式**：显示就诊日期、就诊时间、接诊医生等门诊字段
- **住院模式**：显示床号、入院日期、主治医生、身份证号等住院字段
- 模式切换自动刷新页面，确保数据一致性
- 不同模式下的统计卡片和告警规则自动适配

### 3. 工作台 Dashboard
- 统计卡片展示（今日门诊量/入院量、待完成病历、累计患者等）
- 最近编辑病历列表（支持门诊/住院模式分别展示）
- 超时病历告警提示（仅住院模式）
- 常用模板快捷入口
- 已完成/未完成状态标记

### 4. 患者管理
- 门诊/住院患者列表分开展示
- 按姓名/诊断搜索
- 按科室筛选
- 查看患者详情
- 一键跳转病历书写

### 5. 智能病历书写
- **结构化表单**：主诉、现病史（急性/慢性/亚急性）、诊断（支持ICD-10建议）、既往史、体格检查、过敏史
- **症状标签选择**：快速选择常见症状
- **生命体征录入**：体温、心率、呼吸、血压
- **富文本编辑**：支持格式化、引用块样式
- **患者信息自动关联**：显示当前患者基本信息
- **草稿自动保存**：30秒防抖自动保存
- **草稿恢复**：页面崩溃后一键恢复

### 6. 多源数据引用
- **医嘱引用**：从模板库引用医嘱（抗感染方案、补液方案等）
- **检验结果引用**：引用 LIS 系统检验数据（支持异常值高亮）
- **影像报告引用**：引用 PACS 系统影像描述
- **病历模板引用**：使用预设模板快速书写
- **引用预览**：插入前预览选中内容
- **多选支持**：支持同时选中多个项目

### 7. 病历质控
- 质控规则配置（主诉必填、现病史必填、诊断必填等）
- 自动评分（满分100分）
- 等级评定（A/B/C/D）
- 质控历史记录
- 问题项详细展示

### 8. 模板库管理
- 模板分类（常用模板、入院记录、病程记录、出院小结）
- 模板搜索
- 新建模板
- 编辑/删除模板

### 9. 状态管理
- 已完成/未完成状态标记
- 超时告警（入院记录8小时、病程记录24小时、出院小结24小时）
- 实时更新工作台状态
- 病历记录持久化存储

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5.30 | 前端框架 |
| Vite | ^7.3.1 | 构建工具 |
| Pinia | ^3.0.4 | 状态管理 |
| Vue Router | ^5.0.3 | 路由管理 |
| Element Plus | ^2.13.5 | UI组件库 |
| Tiptap / Vue-Quill | ^1.2.0 / ^2.0.3 | 富文本编辑器 |
| lodash-es | ^4.17.23 | 工具库（防抖等） |

## 📁 项目结构

# 电子病历智能书写系统 (EMR Smart Writing System)

一个基于 Vue 3 开发的智能电子病历前端系统，支持结构化病历书写、多源临床数据引用、智能提醒和草稿自动保存等功能。

## 📋 项目简介

本项目是一个面向临床医生的智能电子病历书写前端原型系统，旨在解决传统电子病历系统中存在的重复录入、数据引用繁琐、易丢失内容等问题。系统通过组件化架构实现结构化字段与富文本的协同编辑，支持从医嘱、检验结果、影像报告等多源数据中智能引用内容，并提供本地自动保存机制。

## ✨ 功能特性

### 1. 用户认证
- 登录/登出功能
- 记住登录状态

### 2. 工作台 Dashboard
- 统计卡片展示（今日接诊、待写病历、在院患者等）
- 最近编辑病历列表
- 超时病历告警提示
- 常用模板快捷入口

### 3. 患者管理
- 患者列表展示
- 按姓名/诊断搜索
- 按科室筛选
- 查看患者详情

### 4. 智能病历书写
- **结构化表单**：主诉、现病史、诊断等结构化字段
- **富文本编辑**：支持格式化和内容编辑
- **患者信息展示**：自动显示当前患者信息
- **草稿自动保存**：30秒防抖自动保存
- **草稿恢复**：页面崩溃后一键恢复

### 5. 多源数据引用
- **医嘱引用**：从模板库引用医嘱
- **检验结果引用**：引用 LIS 系统检验数据
- **影像报告引用**：引用 PACS 系统影像描述
- **病历模板**：使用预设模板快速书写

### 6. 状态管理
- 已完成/未完成状态标记
- 超时告警（入院记录8小时、病程记录24小时）
- 实时更新工作台状态

## 🛠️ 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite
- **状态管理**：Pinia
- **UI组件库**：Element Plus
- **路由管理**：Vue Router
- **富文本编辑器**：Quill (@vueup/vue-quill)
- **工具库**：lodash-es
- **开发语言**：JavaScript

## 📁 项目结构

emr-system/
├── public/ # 静态资源
├── src/
│ ├── assets/ # 资源文件
│ ├── components/ # 组件
│ │ ├── common/ # 通用组件
│ │ │ ├── ModeSwitcher.vue # 门诊/住院模式切换
│ │ │ └── DraftRecoveryBar.vue # 草稿恢复条
│ │ ├── editor/ # 编辑器相关组件
│ │ │ ├── DataReferencePanel.vue # 数据引用面板
│ │ │ ├── EMREditor.vue # 病历编辑器主组件
│ │ │ ├── QuillEditor.vue # 富文本编辑器
│ │ │ └── StructuredForm.vue # 结构化表单
│ │ └── layout/ # 布局组件
│ │ ├── DoctorLayout.vue # 医生工作台布局
│ │ ├── HeaderBar.vue # 顶部导航栏（含模式切换）
│ │ └── SidebarMenu.vue # 侧边栏菜单
│ ├── mock/ # Mock 数据
│ │ ├── patients.json # 住院患者数据
│ │ ├── patients_outpatient.json # 门诊患者数据
│ │ ├── orders.json # 医嘱模板
│ │ ├── lisData.json # 检验数据（LIS）
│ │ ├── pacsData.json # 影像数据（PACS）
│ │ └── templates.json # 病历模板
│ ├── router/ # 路由配置
│ │ └── index.js
│ ├── services/ # 服务层
│ │ └── storageService.js # 本地存储服务
│ ├── stores/ # Pinia 状态管理
│ │ ├── userStore.js # 用户状态
│ │ ├── patientStore.js # 患者状态
│ │ ├── emrStore.js # 病历编辑状态
│ │ ├── emrRecordStore.js # 病历记录状态
│ │ ├── referenceStore.js # 数据引用状态
│ │ ├── systemModeStore.js # 门诊/住院模式状态
│ │ ├── alertStore.js # 告警规则状态
│ │ └── qualityControlStore.js # 质控规则状态
│ ├── utils/ # 工具函数
│ │ ├── autoSave.js # 自动保存
│ │ ├── modeAdapter.js # 模式适配器
│ │ └── ruleEngine.js # 数据转写规则
│ ├── views/ # 页面视图
│ │ ├── LoginView.vue # 登录页
│ │ ├── DashboardView.vue # 工作台
│ │ ├── PatientListView.vue # 患者列表
│ │ ├── EMREditorView.vue # 病历编辑器
│ │ ├── DataReferenceView.vue # 数据引用
│ │ ├── TemplateLibraryView.vue # 模板库
│ │ ├── QualityManageView.vue # 病历质控
│ │ └── NotFoundView.vue # 404页面
│ ├── App.vue # 根组件
│ ├── main.js # 入口文件
│ └── styles.css # 全局样式
├── .gitignore # Git忽略文件
├── index.html # HTML模板
├── package.json # 项目依赖
├── README.md # 项目说明
└── vite.config.js # Vite配置

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/xixianlin9-netizen/EMR-Intelligent-writing-system.git
cd emr-system
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 访问应用
打开浏览器访问 `http://localhost:5173`

### 测试账号
- 用户名：任意（如：张医生、李医生等）
- 密码：123456（任意）

 使用指南
1. 登录系统
输入任意用户名，密码为 123456，点击登录进入工作台。

2. 模式切换
点击顶部导航栏的"门诊模式/住院模式"切换系统模式

切换后页面自动刷新，患者列表字段会相应调整

3. 工作台
查看统计数据（今日门诊量/入院量、待完成病历等）

查看最近编辑的病历

点击"继续编辑"进入病历书写

点击常用模板快速开始

4. 患者列表
浏览所有患者（门诊/住院模式分别展示）

使用搜索框筛选患者

按科室筛选

点击"写病历"为指定患者创建病历

5. 病历书写
填写结构化表单（主诉、现病史、诊断、体格检查等）

使用左侧数据引用面板引用医嘱、检验结果、影像报告

富文本编辑器支持格式化

编辑完成后点击"保存"或"提交"

提交后病历状态变为"已完成"

6. 数据引用
切换选项卡选择不同类型数据（医嘱/检验/影像/模板）

勾选需要引用的项目

点击"插入选中项"将内容插入到病历中

支持检验数据按日期筛选和异常值高亮

7. 病历质控
选择患者后点击"开始质控"

系统自动检查病历完整性

显示评分和问题列表

可查看历史质控记录

🔧 核心功能详解
门诊/住院双模式
系统支持两种工作模式：

门诊模式：面向门诊场景，显示就诊日期、就诊时间、接诊医生等

住院模式：面向住院场景，显示床号、入院日期、主治医生等，并启用超时告警

模式切换通过 Pinia Store 管理，切换后自动刷新页面并重新加载对应数据。

智能告警
系统会自动检测未完成的病历，根据类型设置不同的超时时间：

入院记录：8小时内完成

病程记录：24小时内完成

出院小结：24小时内完成

超时后会在工作台顶部显示告警提示（仅住院模式）。

草稿自动保存
用户停止输入30秒后自动保存（使用 lodash debounce）

页面崩溃或刷新后可一键恢复

提交后自动清除草稿

草稿数据存储在 localStorage

数据引用转写
检验结果和影像报告会自动转写为规范的医学描述：

检验结果：白细胞 6.5×10⁹/L（参考范围 4.0-10.0）

异常值标记：↑（偏高）、↓（偏低）

影像描述：胸部CT示：双肺纹理增粗

病历质控规则
主诉必填（扣15分）

现病史必填（扣15分）

诊断必填（扣15分）

主诉长度合理（5-200字，扣5分）

现病史包含时间描述（扣10分）

诊断描述规范（扣10分）

🧪 开发计划
已完成功能 ✅
用户登录/登出

门诊/住院双模式切换

工作台 Dashboard

患者列表（门诊/住院分开展示）

病历编辑器（结构化+富文本）

数据引用面板（医嘱/检验/影像/模板）

模板库管理

草稿自动保存/恢复

病历状态管理

超时告警

病历质控评分

待开发功能 🔄
病历打印功能

病历导出（PDF/Word）

更多质控规则

患者历史病历查看

数据统计分析报表

移动端适配


##仓库更新命令
git add - 添加修改
git commit -m "具体的更新内容"-提交到本地
git pull - 拉取协作者更新
git push - 推送到远程

