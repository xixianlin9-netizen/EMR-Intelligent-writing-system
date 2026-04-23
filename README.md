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

```markdown
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

```
emr-system/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   ├── components/        # 组件
│   │   ├── common/        # 通用组件
│   │   │   └── DraftRecoveryBar.vue  # 草稿恢复条
│   │   ├── editor/        # 编辑器相关组件
│   │   │   ├── DataReferencePanel.vue  # 数据引用面板
│   │   │   ├── EMREditor.vue           # 病历编辑器主组件
│   │   │   ├── QuillEditor.vue         # 富文本编辑器
│   │   │   └── StructuredForm.vue      # 结构化表单
│   │   └── layout/        # 布局组件
│   │       ├── DoctorLayout.vue        # 医生工作台布局
│   │       ├── HeaderBar.vue           # 顶部导航栏
│   │       └── SidebarMenu.vue         # 侧边栏菜单
│   ├── mock/              # Mock 数据
│   │   ├── patients.json  # 患者数据
│   │   ├── orders.json    # 医嘱模板
│   │   ├── lisData.json   # 检验数据
│   │   ├── pacsData.json  # 影像数据
│   │   └── templates.json # 病历模板
│   ├── router/            # 路由配置
│   │   └── index.js
│   ├── stores/            # Pinia 状态管理
│   │   ├── userStore.js   # 用户状态
│   │   ├── patientStore.js # 患者状态
│   │   ├── emrStore.js    # 病历状态
│   │   └── emrRecordStore.js # 病历记录状态
│   ├── utils/             # 工具函数
│   │   ├── autoSave.js    # 自动保存
│   │   └── ruleEngine.js  # 数据转写规则
│   ├── views/             # 页面视图
│   │   ├── LoginView.vue          # 登录页
│   │   ├── DashboardView.vue      # 工作台
│   │   ├── PatientListView.vue    # 患者列表
│   │   ├── EMREditorView.vue      # 病历编辑器
│   │   ├── DataReferenceView.vue  # 数据引用
│   │   ├── TemplateLibraryView.vue # 模板库
│   │   └── NotFoundView.vue       # 404页面
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── styles.css         # 全局样式
├── .gitignore             # Git忽略文件
├── index.html             # HTML模板
├── package.json           # 项目依赖
├── README.md              # 项目说明
└── vite.config.js         # Vite配置
```

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

## 📖 使用指南

### 1. 登录系统
输入任意用户名，密码为 `123456`，点击登录进入工作台。

### 2. 工作台
- 查看统计数据和告警信息
- 查看最近编辑的病历
- 点击"继续编辑"进入病历书写
- 点击常用模板快速开始

### 3. 患者列表
- 浏览所有患者
- 使用搜索框筛选患者
- 点击"写病历"为指定患者创建病历

### 4. 病历书写
- 填写结构化表单（主诉、现病史、诊断等）
- 使用左侧面板引用医嘱、检验结果、影像报告
- 编辑完成后点击"保存"或"提交"
- 提交后病历状态变为"已完成"

### 5. 数据引用
- 切换选项卡选择不同类型数据
- 勾选需要引用的项目
- 点击"插入选中项"将内容插入到病历中

## 🔧 核心功能详解

### 智能告警
系统会自动检测未完成的病历，根据类型设置不同的超时时间：
- 入院记录：8小时内完成
- 病程记录：24小时内完成
- 出院小结：24小时内完成

超时后会在工作台顶部显示告警提示。

### 草稿自动保存
- 用户停止输入30秒后自动保存
- 页面崩溃或刷新后可一键恢复
- 提交后自动清除草稿

### 数据引用转写
检验结果和影像报告会自动转写为规范的医学描述：
- 检验结果：`白细胞 6.5×10⁹/L（参考范围 4.0-10.0）`
- 异常值标记：↑（偏高）、↓（偏低）
- 影像描述：`胸部CT示：双肺纹理增粗`

## 🧪 开发计划

### 已完成功能 ✅
用户登录/登出
工作台 Dashboard
患者列表
病历编辑器（结构化+富文本）
数据引用面板
模板库
草稿自动保存/恢复
病历状态管理
超时告警


本项目仅供学习交流使用，未经许可不得用于商业用途。

