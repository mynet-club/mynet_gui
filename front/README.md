# MyNet Frontend

MyNet 前端应用，基于 Vue 3 + Quasar Framework 构建的现代化网络管理系统界面。

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 代码检查

```bash
npm run lint
```

## 📋 功能特性

- ✅ **用户认证系统**: JWT Token认证，自动刷新
- ✅ **多区域隔离**: Zone-based数据隔离和权限管理
- ✅ **节点管理**: 网络节点的CRUD操作和状态监控
- ✅ **路由管理**: 网络路由配置和拓扑管理
- ✅ **实时监控**: WebSocket实时数据推送
- ✅ **多语言支持**: 中文/英文国际化
- ✅ **响应式设计**: 支持桌面和移动端
- ✅ **主题系统**: 亮色/暗色主题切换

## 🏗️ 技术架构

### 技术栈
- **框架**: Vue 3 + Composition API + TypeScript
- **UI框架**: Quasar Framework
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **构建工具**: Vite
- **代码检查**: ESLint + TypeScript
- **样式**: SCSS + Quasar Variables

### 目录结构

```
src/
├── boot/           # 启动文件
├── components/     # 可复用组件
├── composables/    # 组合式函数
├── css/           # 样式文件
├── i18n/          # 国际化
├── layouts/       # 布局组件
├── pages/         # 页面组件
├── router/        # 路由配置
├── services/      # API服务
├── stores/        # 状态管理
└── types/         # 类型定义
```

## 📖 详细文档

- [项目概述](./docs/01-项目概述.md)
- [架构设计](./docs/02-架构设计.md)
- [开发指南](./docs/03-开发指南.md)
- [迁移记录](./docs/04-迁移记录.md)
- [API文档](./docs/05-API文档.md)
- [部署指南](./docs/06-部署指南.md)

## 🔧 开发环境要求

- Node.js >= 16
- npm >= 8

## 🚀 部署

### 开发环境部署

```bash
npm run dev
```

### 生产环境构建

```bash
npm run build
```

构建完成后，`dist` 目录包含可部署的静态文件。

## 🤝 贡献指南

1. 遵循项目的代码规范
2. 提交前运行 `npm run lint` 检查代码
3. 确保所有功能正常工作
4. 添加必要的文档说明

## 📞 支持

如有问题，请通过以下方式联系：

- 创建 Issue
- 发起 Pull Request
- 联系项目维护者
