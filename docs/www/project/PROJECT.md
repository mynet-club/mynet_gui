# MyNet Web - 项目概述

> 基于 [MyNet 产品宣言](../manifesto/MANIFESTO.md) 的官方门户网站

---

## 🎯 项目定位

MyNet Web 是 MyNet 项目的官方门户网站，用于介绍 MyNet - 一个**以"连接选择权"为核心的自主网络系统**。

### 本网站提供

- **核心理念**：连接选择权的深入阐释
- **Zone 概念**：作为连接前置条件的安全边界
- **GNB 技术**：端到端加密的 P2P 组网协议
- **使用指南**：如何加入和使用 Zone
- **客户端下载**：多平台客户端和工具
- **管理入口**：登录注册和控制台入口

---

## 🌐 核心概念

### 连接选择权

MyNet 关注的不是"网络的拥有权"，而是**连接发生与否的决定权**。

用户始终拥有对以下行为的完全控制权：
- 是否进入某个网络空间
- 是否与某个节点建立连接
- 是否访问某类资源或内容
- 是否随时断开、退出或更换关系

**真正的自由不是"我可以连接所有人"，而是"我可以决定是否连接任何人"。**

### Zone 的真实定义

Zone 是 MyNet 中**连接发生的前置条件**，而不是连接本身。

**Zone 的核心作用：**
- 提供清晰、可控的隔离边界
- 限定连接可以发生的范围
- 使"选择连接"这件事具备安全性与意义

**Zone 本身不等于关系、不等于信任、不等于社交结果。**  
它只是一个结构性空间，用来承载可能发生的连接。

### 用户体验路径

1. **注册** → 自动加入 MyNet Nomadic Village（默认 Zone）
2. **探索** → 在 Village 中发现可以连接的节点
3. **选择** → 主动决定是否与某个节点建立连接
4. **管理** → 随时查看、调整或断开已有连接
5. **拓展** → 可以被邀请加入其他 Zone（非必须）

**核心体验是"选择进入并连接"，而非"创建和管理 Zone"。**

### 技术驱动

- **GNB 协议**：采用 OpenGNB 作为唯一网络驱动
- **P2P 组网**：点对点直连，减少中间节点
- **端到端加密**：保护通信隐私和安全
- **NAT 穿透**：自动穿透防火墙
- **跨平台**：支持 Linux、macOS、Windows、OpenWrt

---

## 🏗️ 技术架构

### 前端技术栈

```
Vue 3.4+              # 渐进式 JavaScript 框架
TypeScript 5.3+       # 类型安全的 JavaScript 超集
Vite 5.0+             # 新一代前端构建工具
Vue Router 4.2+       # 官方路由管理器
```

### 设计原则

1. **连接选择权优先**：所有设计服从 P1-P15 产品原则
2. **简洁明了**：信息层次清晰，内容易于理解
3. **响应式设计**：完美适配桌面、平板、手机等设备
4. **快速加载**：优化资源加载，提升用户体验
5. **易于维护**：清晰的代码结构，便于后续维护

### 产品原则约束

遵循 [MyNet 产品原则](../manifesto/MANIFESTO.md#mynet-产品原则derived)：
- P1-P3：总体原则（连接选择权、Zone 定位、进入优先）
- P4-P6：Zone 相关原则（隔离边界、不等于信任、不成为负担）
- P7-P9：连接相关原则（显性、可撤销、拒绝是一等公民）
- P10-P11：默认行为原则（默认不连接、默认不扩散）
- P12-P13：产品表达原则（不以拥有感驱动、不制造幻觉）
- P14-P15：演进扩展原则（功能可删除、商业化不凌驾）

---

## 📄 页面结构

### 1. 首页 (HomePage)
**目标**：传达连接选择权的核心理念

内容：
- Hero：MyNet - 以连接选择权为核心的自主网络
- 核心理念：你决定与谁连接、何时连接、如何连接
- Zone 作为安全边界的介绍
- 快速开始：加入 MyNet Nomadic Village
- CTA：登录/注册、下载客户端

**原则遵循**：
- ✅ 强调连接选择权（P1）
- ✅ Zone 作为结构性存在（P2）
- ✅ 进入 Village 而非创建 Zone（P3）
- ❌ 避免"拥有感"表达（P12）

### 2. 特性页 (FeaturesPage)
**目标**：展示 MyNet 的核心特性和技术优势

内容：
- 连接选择权核心特性
- Zone 作为安全边界
- 安全和私密性（端到端加密）
- GNB 协议优势
- 多平台支持

**原则遵循**：
- ✅ Zone 作为隔离边界（P4）
- ✅ 强调显性连接（P7）
- ✅ 默认不连接（P10）

### 3. 文档页 (DocsPage)
**目标**：提供完整的使用指南和技术文档

内容：
- 入门指南（如何加入 MyNet Nomadic Village）
- 如何加入和使用 Zone
- 如何建立和管理连接
- 客户端安装和配置
- GNB 协议配置
- API 参考

**原则遵循**：
- ✅ 进入优先于创建（P3）
- ✅ 连接必须是显性的（P7）
- ✅ 连接必须是可撤销的（P8）
- ✅ 拒绝是一等公民（P9）

### 4. 下载页 (DownloadPage)
**目标**：提供各平台客户端下载

内容：
- Web 管理端入口：https://my.mynet.club
- 管理控制台：https://ctl.mynet.club（管理员）
- TUI 客户端下载（Linux/macOS/Windows/OpenWrt）
- GNB 二进制下载：https://download.mynet.club
- 安装指南和系统要求

**原则遵循**：
- ✅ 提供多平台支持
- ✅ 强调 GNB 作为唯一协议
- ❌ 不提及 OpenVPN/WireGuard

### 5. 关于页 (AboutPage)
**目标**：介绍 MyNet 项目和技术背景

内容：
- MyNet 项目介绍：连接选择权的理念
- Zone 的真实定义
- GNB 技术说明
- 项目组件（mynet_gnb, mynet_back, mynet_gui, mynet_tui）
- GitHub 链接：https://github.com/gnbdev/opengnb
- 联系方式

**原则遵循**：
- ✅ 清晰传达核心理念
- ✅ Zone 的正确定义（P2）
- ❌ 不展示 MyNet 相关 GitHub

---

## 🎨 设计系统

### 配色方案

```scss
// 主色调 - 紫色系渐变
$primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

// 中性色
$gray-900: #1f2937;
$gray-700: #374151;
$gray-600: #4b5563;
$gray-500: #6b7280;
$gray-400: #9ca3af;
$gray-300: #d1d5db;
$gray-200: #e5e7eb;
$gray-100: #f3f4f6;
$gray-50: #f9fafb;

// 功能色
$success: #10b981;
$warning: #f59e0b;
$error: #ef4444;
```

### 字体系统

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### 组件规范

- **卡片式布局**：使用圆角卡片展示内容
- **流畅动画**：hover 和过渡效果
- **响应式设计**：移动优先，适配多端
- **清晰层次**：标题、正文、辅助文字的视觉层次

---

## 🚀 开发流程

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 构建部署

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 使用部署脚本
./deploy.sh
```

### 代码规范

- 使用 TypeScript 进行类型检查
- 组件使用 `<script setup>` 语法
- 样式使用 `scoped` 避免污染
- 遵循 Vue 3 最佳实践
- 遵循产品原则 P1-P15

---

## 📋 内容要求

### 必须强调

1. **连接选择权是核心**（P1）
   - 用户拥有完全的连接决定权
   - 可以选择是否进入、是否连接、何时断开

2. **Zone 是前置条件，不是目的**（P2）
   - Zone 提供隔离边界
   - Zone 限定连接发生的范围
   - Zone 不等于关系或信任

3. **MyNet Nomadic Village 是主要空间**（P3）
   - 注册即可加入默认 Zone
   - 强调"进入并选择"而非"创建管理"

4. **使用场景（作为可能性，非主要卖点）**
   - 企业空间：需要管理员邀请
   - 家庭空间、兴趣空间、学习空间等

5. **GNB 技术**
   - 唯一的网络驱动协议
   - P2P 组网、端到端加密
   - 跨平台支持

### 必须移除

- ❌ 所有 OpenVPN/WireGuard 相关内容
- ❌ MyNet 相关的 GitHub 仓库链接
- ❌ 传统 VPN 的定位描述
- ❌ "平行宇宙"、"时空穿梭"等过度包装概念
- ❌ 过度强调 Zone 创建功能
- ❌ "拥有"、"你的世界"等拥有感表达

---

## 🔗 相关资源

### MyNet 项目组件

- **mynet_gnb** - GNB VPN 驱动的构建和发布
- **mynet_back** - Laravel 后端管理系统
- **mynet_gui** - Vue3 Web 前端界面
- **mynet_tui** - Go TUI 终端客户端

### 相关站点

- **my.mynet.club** - 用户管理中心（登录/注册）
- **ctl.mynet.club** - 控制台管理（管理员）
- **download.mynet.club** - 客户端下载中心

### 外部资源

- [OpenGNB 官方仓库](https://github.com/gnbdev/opengnb)
- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)

---

## 📚 文档结构

```
docs/
├── manifesto/              # 产品宣言（只读）
│   └── MANIFESTO.md       # MyNet 核心思想和原则
├── development/           # 开发规范
│   └── COPILOT_INSTRUCTIONS.md  # Copilot 开发规范
└── project/              # 项目文档
    ├── PROJECT.md        # 本文档：项目概述
    └── SUMMARY.md        # 项目总结

README.md                 # 项目入口（根目录）
```

---

## 🎯 快速否决标准

如果一个设计/内容满足以下任意一条，应立即否决：

- ❌ 替用户提前做了连接决定
- ❌ 模糊了 Zone 的隔离边界
- ❌ 把 Zone 变成目的或身份
- ❌ 提高了"拒绝或退出"的心理/操作成本
- ❌ 为了增长牺牲了连接选择权

**核心提醒：任何时候，系统都不能比用户更懂他该连接什么。**

---

## 🤝 贡献指南

### 开发分支策略

- `main`: 生产环境分支
- `develop`: 开发分支
- `feature/*`: 新功能分支
- `fix/*`: 修复分支

### 提交规范

```
feat: 新功能
fix: 修复
docs: 文档更新
style: 样式调整
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具
```

### 内容审核

所有内容变更必须符合：
1. [MyNet 产品宣言](../manifesto/MANIFESTO.md)
2. [Copilot 开发规范](../development/COPILOT_INSTRUCTIONS.md)
3. 产品原则 P1-P15

---

## 📄 许可证

MIT License - 详见 LICENSE 文件
