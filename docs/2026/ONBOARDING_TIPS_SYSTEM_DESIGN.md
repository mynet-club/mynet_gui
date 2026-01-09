# MyNet 新手引导 Tips 系统设计方案

> 渐进式引导用户理解连接、建立连接、管理连接
> 创建时间: 2026-01-06

---

## 📋 目录

1. [设计目标](#设计目标)
2. [引导原则](#引导原则)
3. [引导路径设计](#引导路径设计)
4. [Tips系统架构](#tips系统架构)
5. [交互设计](#交互设计)
6. [技术实现方案](#技术实现方案)

---

## 🎯 设计目标

### 核心目标

1. **降低认知门槛**: 让新用户快速理解"连接"的核心价值，无需理解Zone等技术概念
2. **引导关键行为**: 引导用户完成：添加设备 → 添加好友 → 建立连接
3. **自然学习**: 通过使用过程自然理解产品机制，而非灌输概念
4. **可跳过可回顾**: 用户可随时跳过或重新查看引导

### 非目标

- ❌ 不讲解Zone的技术细节
- ❌ 不强制用户完成所有步骤
- ❌ 不做冗长的产品宣传
- ❌ 不打断用户的正常使用

---

## 💡 引导原则

### 原则 1: 渐进式呈现

**只在需要的时候出现**:
```
用户第一次看到某功能 → 简短提示
用户准备执行某操作 → 操作指引
用户遇到困惑 → 帮助说明
```

### 原则 2: 上下文相关

**Tips内容与当前页面/操作强相关**:
- Dashboard → 连接概览提示
- 设备页面 → 添加设备引导
- 好友页面 → 添加好友引导
- 连接页面 → 建立连接指引

### 原则 3: 简洁明了

**每条Tips**:
- 标题: ≤10字
- 内容: ≤50字
- 操作: 1-2个按钮

### 原则 4: 可控可退

**用户控制权**:
- 可以跳过单条提示
- 可以关闭全部引导
- 可以在帮助中心重新查看
- 可以重置引导进度

---

## 🗺️ 引导路径设计

### 完整引导流程

```
阶段 0: 首次登录
    ↓
阶段 1: 创建IP资源池 (前置必需)
    ↓
阶段 2: 添加第一个设备
    ↓
选择分支: [路径A: 体验自己设备连接] OR [路径B: 与好友建立连接]
    │                                    │
    │ (路径A)                           │ (路径B)
    │                                    │
    阶段 3A: 添加第二个设备               阶段 3B: 和邀请人建立好友
    ↓                                    ↓
    阶段 4A: 理解设备间自动连接         阶段 4B: 查看邀请人设备
    ↓                                    ↓
    阶段 5A: 添加好友(可选)             阶段 5B: 建立跨用户连接
    │                                    │
    └─────────────┬──────────────────┘
                  ↓
              阶段 6: 管理连接
                  ↓
              阶段 7: 进阶功能 (可选)
```

---

## 🎬 各阶段详细设计

### 阶段 0: 首次登录欢迎

**触发时机**: 用户首次登录成功，进入Dashboard

**Tips类型**: 欢迎弹窗 (Modal)

**内容设计**:
```
┌──────────────────────────────────────┐
│  🎉 欢迎加入 MyNet!                   │
├──────────────────────────────────────┤
│                                      │
│  你已通过 [邀请人] 的邀请加入这个网络 │
│                                      │
│  接下来我们将引导你:                  │
│  1️⃣ 添加你的设备                      │
│  2️⃣ 添加好友                          │
│  3️⃣ 建立安全连接                      │
│                                      │
│  预计耗时: 5分钟                      │
│                                      │
│  [开始引导]  [稍后再说]               │
│                                      │
│  ☑️ 不再显示此欢迎                    │
└──────────────────────────────────────┘
```

**交互逻辑**:
- 点击"开始引导" → 进入阶段1
- 点击"稍后再说" → 关闭，记录状态
- 勾选"不再显示" → 永久关闭欢迎弹窗

**状态记录**: `onboarding.welcome_shown = true`

---

### 阶段 1: 创建IP资源池 (前置必需)

**触发时机**: 
- 用户选择"开始引导"
- 或用户进入设备页面但没有可用IP资源池

**Tips类型**: 引导高亮 (Spotlight) + 侧边提示

**页面**: `/app/advanced/ippools`

**设计目标**: 让用户理解资源池是添加设备的前提条件

**视觉设计**:
```
┌────────────────────────────────────────┐
│ IP资源池                    [🔆高亮]   │
├────────────────────────────────────────┤
│                                        │
│  (暗背景遮罩)                           │
│                                        │
│  ┌──────────────────────┐             │
│  │ [➕ 创建资源池]       │ ← 高亮突出  │
│  └──────────────────────┘             │
│         ↑                              │
│    ┌────┴───────────────────────┐     │
│    │ 💡 第一步: 创建IP资源池    │     │
│    │                            │     │
│    │ 资源池为你的设备提供IP地址  │     │
│    │ 这是添加设备的前提条件      │     │
│    │                            │     │
│    │ 别担心，我们会提供推荐配置  │     │
│    │                            │     │
│    │ [开始创建] [跳过]          │     │
│    └────────────────────────────┘     │
│                                        │
└────────────────────────────────────────┘
```

**引导步骤**:

**1.1 解释资源池概念**
```
┌────────────────────────────────────┐
│ 💡 什么是IP资源池?                 │
├────────────────────────────────────┤
│                                    │
│ IP资源池是一组可用的IP地址范围      │
│                                    │
│ 作用:                               │
│ ✓ 为你的每个设备分配IP地址          │
│ ✓ 让设备之间可以相互通信            │
│ ✓ 管理网络资源                      │
│                                    │
│ 必须先创建资源池，才能添加设备      │
│                                    │
│ [知道了，开始创建]                  │
└────────────────────────────────────┘
```

**1.2 创建资源池表单**
```
提示: "填写资源池信息"

表单字段:
┌────────────────────────────────┐
│ 资源池名称*                     │
│ [默认资源池__________]         │
│                                │
│ IP地址范围*                     │
│ [10.0.0.0/24_________]         │
│ 💡 推荐使用私有IP段             │
│                                │
│ 推荐配置 (点击使用):            │
│ • 10.0.0.0/24 (254个可用IP)    │
│ • 172.16.0.0/24                │
│ • 192.168.100.0/24             │
│                                │
│ [创建] [取消]                   │
└────────────────────────────────┘
```

**1.3 资源池创建成功**
```
┌────────────────────────────────────┐
│ ✅ 资源池创建成功!                  │
├────────────────────────────────────┤
│                                    │
│ 资源池名称: 默认资源池              │
│ IP范围: 10.0.0.0/24                │
│ 可用IP数: 254                      │
│                                    │
│ 现在你可以添加设备了!               │
│                                    │
│ 每个设备会自动从资源池               │
│ 获得一个唯一的IP地址                │
│                                    │
│ [继续添加设备] → 阶段2              │
└────────────────────────────────────┘
```

**状态记录**: `onboarding.first_ippool_created = true`

---

### 阶段 2: 添加第一个设备

**触发时机**: 创建IP资源池成功后

**Tips类型**: 引导高亮 + 操作提示

**页面**: `/app/devices`

**视觉设计**:
```
┌────────────────────────────────────┐
│ 我的设备                [🔆高亮]   │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────┐             │
│  │ [➕ 添加设备]     │ ← 高亮     │
│  └──────────────────┘             │
│         ↑                          │
│    ┌────┴──────────────────┐      │
│    │ 💡 添加你的第一个设备  │      │
│    │                       │      │
│    │ 资源池已就绪!          │      │
│    │ 现在添加设备，它会自动  │      │
│    │ 从资源池获得IP地址      │      │
│    │                       │      │
│    │ [点击添加] [跳过]     │      │
│    └───────────────────────┘      │
└────────────────────────────────────┘
```

**引导步骤**:

**2.1 选择设备类型**
```
提示: "选择你要添加的设备类型"
说明:
- 💻 电脑/笔记本: 日常工作设备
- 📱 手机/平板: 移动设备
- 🖥️ 服务器/NAS: 存储和服务
- 🌐 路由器: 网络设备

操作: 等待用户选择
```

**2.2 下载并配置客户端**
```
提示: "在你的设备上安装客户端"
内容:
- 下载链接
- 配置凭证(自动从资源池分配IP)
- 一键复制配置

注意: 设备会自动获得IP: 10.0.0.2

操作: 等待设备上线
```

**2.3 第一个设备上线 - 双路径选择**
```
┌────────────────────────────────────┐
│ ✅ 设备添加成功!                    │
├────────────────────────────────────┤
│                                    │
│ 💻 我的MacBook                     │
│ IP地址: 10.0.0.2                   │
│ 状态: 在线 🟢                       │
│                                    │
│ 💡 接下来你可以:                    │
│                                    │
│ 路径A: 体验自己设备间的连接         │
│ • 添加第二个设备(手机/平板等)      │
│ • 它们会自动互联，无需手动配置      │
│                                    │
│ 路径B: 和邀请人建立连接            │
│ • 你和邀请你的人已是好友           │
│ • 直接连接对方的设备               │
│                                    │
│ [添加第二个设备] [连接邀请人]         │
│ [稍后再说]                          │
└────────────────────────────────────┘
```

**选择逻辑**:
- 点击"添加第二个设备" → 路径A (阶段3A)
- 点击"连接邀请人" → 路径B (阶段3B)
- 点击"稍后再说" → 结束引导，用户自行探索

**状态记录**: `onboarding.first_device_added = true`

---

### 阶段 3: 添加第二个设备 (体验自动连接)

**触发时机**: 第一个设备添加成功后

**Tips类型**: 引导提示

**页面**: `/app/devices`

**设计目标**: 让用户体验设备间的自动连接机制

**视觉设计**:
```
┌────────────────────────────────────┐
│ 💡 添加第二个设备                   │
├────────────────────────────────────┤
│                                    │
│ 当你有多个设备时，它们会             │
│ 自动建立连接，无需手动配置!          │
│                                    │
│ 这样你可以:                         │
│ ✓ 在设备间传输文件                  │
│ ✓ 跨设备访问资源                    │
│ ✓ 同步数据                          │
│                                    │
│ 现在添加第二个设备，                │
│ 看看自动连接如何工作                │
│                                    │
│ [添加第二个设备] [稍后再说]         │
└────────────────────────────────────┘
```

**引导步骤**:

**3.1 添加第二个设备**
```
操作: 重复阶段2的添加流程
注意: 第二个设备会自动获得IP: 10.0.0.3
```

**3.2 自动连接建立**
```
┌────────────────────────────────────┐
│ 🎉 自动连接已建立!                  │
├────────────────────────────────────┤
│                                    │
│ 你的设备已自动互联:                 │
│                                    │
│ 💻 我的MacBook (10.0.0.2)          │
│      ↕️                            │
│ 📱 我的iPhone (10.0.0.3)           │
│                                    │
│ 连接状态: 活跃 🟢                   │
│ 延迟: <1ms (本地)                  │
│                                    │
│ 💡 你自己的设备之间默认互通          │
│ 这个连接无法断开，也不需要断开       │
│                                    │
│ [查看连接详情] → 阶段4              │
└────────────────────────────────────┘
```

**状态记录**: `onboarding.second_device_added = true`

---

### 阶段 3B: 和邀请人建立好友 (路径B)

**触发时机**: 用户在阶段2选择"连接邀请人"

**Tips类型**: 信息提示

**页面**: `/app/friends`

**内容设计**:
```
┌────────────────────────────────────┐
│ 👥 你和邀请人已是好友!              │
├────────────────────────────────────┤
│                                    │
│ 好消息!                             │
│                                    │
│ 邀请你加入MyNet的人:               │
│ 👤 [邀请人名称]                    │
│                                    │
│ 已经自动成为你的好友！              │
│                                    │
│ 💡 这意味着:                       │
│ ✓ 你可以看到TA的设备               │
│ ✓ 可以请求连接TA的设备             │
│ ✓ TA也可以连接你的设备             │
│                                    │
│ [查看TA的设备] → 阶段4B            │
└────────────────────────────────────┘
```

**状态记录**: `onboarding.inviter_friend_added = true`

---

### 阶段 4B: 查看邀请人的设备 (路径B)

**触发时机**: 与邀请人建立好友关系后

**Tips类型**: 引导提示

**页面**: `/app/friends/devices`

**内容设计**:
```
┌────────────────────────────────────┐
│ 🖥️ 邀请人的设备                     │
├────────────────────────────────────┤
│                                    │
│ [邀请人名称] 的设备:                │
│                                    │
│ 💻 服务器 (10.0.0.5)               │
│ 状态: 在线 🟢                       │
│                                    │
│ 📱 手机 (10.0.0.6)                  │
│ 状态: 离线 ⚪                       │
│                                    │
│ 💡 你可以请求连接这些设备          │
│                                    │
│ 比如连接TA的服务器，                │
│ 访问共享的文件或服务               │
│                                    │
│ [请求连接服务器] → 阶段5B          │
└────────────────────────────────────┘
```

**状态记录**: `onboarding.inviter_devices_viewed = true`

---

### 阶段 5B: 建立与邀请人的连接 (路径B)

**触发时机**: 查看邀请人设备后

**Tips类型**: 操作引导

**页面**: `/app/connections` 或 `/app/friends/devices`

**引导步骤**: 与阶段7类似，但默认选择邀请人的设备

**状态记录**: `onboarding.cross_user_connection_established = true`

---

### 阶段 4: 理解设备间的自动连接

**触发时机**: 用户添加第一个设备后，理解设备概念后

**Tips类型**: 引导高亮 + 操作提示

**页面**: `/app/advanced/ippools`

**设计目标**: 引导用户创建第一个IP资源池，为后续连接分配IP做准备

**视觉设计**:
```
┌────────────────────────────────────────┐
│ IP资源池                    [🔆高亮]   │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────┐                 │
│  │ [➕ 创建资源池]   │ ← 高亮突出      │
│  └──────────────────┘                 │
│         ↑                              │
│    ┌────┴───────────────────┐         │
│    │ 💡 创建IP资源池        │         │
│    │                        │         │
│    │ 资源池用于管理IP地址    │         │
│    │ 为你的设备分配网络资源  │         │
│    │                        │         │
│    │ 这是连接的基础设施      │         │
│    │                        │         │
│    │ [开始创建] [了解更多]  │         │
│    └────────────────────────┘         │
│                                        │
└────────────────────────────────────────┘
```

**引导步骤**:

**2.5.1 解释资源池概念**
```
┌────────────────────────────────────┐
│ 💡 什么是IP资源池?                  │
├────────────────────────────────────┤
│                                    │
│ IP资源池是一组可用的IP地址范围      │
│                                    │
│ 作用:                               │
│ ✓ 为你的设备分配IP地址              │
│ ✓ 为连接分配网络资源                │
│ ✓ 管理和约束IP使用                  │
│                                    │
│ 你需要至少创建一个资源池            │
│ 才能建立设备间的连接                │
│                                    │
│ [知道了，开始创建]                  │
└────────────────────────────────────┘
```

**2.5.2 创建资源池表单**
```
提示: "填写资源池信息"

表单字段:
┌────────────────────────────────┐
│ 资源池名称*                     │
│ [默认资源池__________]         │
│                                │
│ IP地址范围*                     │
│ [10.0.0.0/24_________]         │
│ 💡 建议使用私有IP段             │
│                                │
│ 描述 (可选)                     │
│ [用于设备连接的IP池___]         │
│                                │
│ [创建] [取消]                   │
└────────────────────────────────┘

推荐配置:
- 10.0.0.0/24 (254个可用IP)
- 172.16.0.0/24 (254个可用IP)
- 192.168.100.0/24 (254个可用IP)
```

**2.5.3 资源池创建成功**
```
┌────────────────────────────────────┐
│ ✅ 资源池创建成功!                  │
├────────────────────────────────────┤
│                                    │
│ 资源池名称: 默认资源池              │
│ IP范围: 10.0.0.0/24                │
│ 可用IP数: 254                      │
│                                    │
│ 现在你可以:                         │
│ ✓ 为设备分配IP地址                 │
│ ✓ 建立设备间的连接                 │
│ ✓ 随时查看资源使用情况              │
│                                    │
│ 接下来: 添加好友，准备建立连接      │
│                                    │
│ [继续] → 阶段3                      │
└────────────────────────────────────┘
```

**2.5.4 资源池管理说明 (可选展示)**
```
┌────────────────────────────────────┐
│ 💡 资源池管理提示                   │
├────────────────────────────────────┤
│                                    │
│ 你可以稍后在这里:                   │
│                                    │
│ 📊 查看IP使用情况                   │
│   - 已分配/可用IP                  │
│   - 资源池利用率                    │
│                                    │
│ ⚙️ 管理资源池                       │
│   - 创建多个资源池                  │
│   - 调整IP范围                      │
│   - 删除未使用的资源池              │
│                                    │
│ 这是高级功能，新手可以先跳过        │
│                                    │
│ [知道了]                            │
└────────────────────────────────────┘
```

**关键说明点**:

1. **为什么需要资源池**:
   - 资源池是网络连接的基础设施
   - 提供IP地址分配和管理
   - 是连接建立的前置条件

2. **简化理解**:
   - 不深入解释网络技术细节
   - 提供推荐配置，用户可直接使用
   - 强调"这是必需步骤"

3. **预埋高级功能**:
   - 提示用户未来可以创建多个资源池
   - 说明资源管理的价值
   - 但不强制用户立即掌握

**状态记录**: `onboarding.auto_connection_understood = true`

---

### 阶段 5: 添加好友

**触发时机**: 
- 完成阶段1后自动引导
- 或用户进入好友页面且好友数 = 0

**Tips类型**: 引导高亮 + 操作提示

**页面**: `/app/friends`

**视觉设计**:
```
┌────────────────────────────────────┐
│ 好友                    [🔆高亮]   │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────┐             │
│  │ [👥 添加好友]     │ ← 高亮     │
│  └──────────────────┘             │
│         ↑                          │
│    ┌────┴──────────────────┐      │
│    │ 💡 添加好友            │      │
│    │                       │      │
│    │ 添加你想要连接的       │      │
│    │ 朋友、同事或家人       │      │
│    │                       │      │
│    │ 只有成为好友后，       │      │
│    │ 才能看到彼此的设备     │      │
│    │                       │      │
│    │ [点击添加] [跳过]     │      │
│    └───────────────────────┘      │
└────────────────────────────────────┘
```

**引导步骤**:

**3.1 添加好友方式说明**
```
提示: "有两种方式添加好友"

方式1: 搜索用户名/邮箱
- 输入好友的用户名或邮箱
- 发送好友请求
- 等待对方同意

方式2: 分享你的邀请
- 生成邀请链接
- 分享给朋友
- 朋友注册后自动成为好友

[搜索好友] [生成邀请]
```

**3.2 搜索并添加**
```
输入框: "请输入用户名或邮箱"
提示: "确保对方也在这个网络中"

找到后:
┌──────────────────┐
│ 👤 张三           │
│ zhang@email.com  │
│ [发送好友请求]    │
└──────────────────┘
```

**3.3 等待接受**
```
提示: "好友请求已发送"
状态: 等待 [张三] 接受

你也可以:
- 继续添加其他好友
- 邀请更多人加入
- 查看待接受列表

[继续添加] [查看待接受]
```

**3.4 好友添加成功**
```
✅ 提示: "太棒了! [张三] 已接受你的好友请求"

现在你可以:
- 查看 [张三] 的设备
- 请求连接到他的设备
- 分享资源给他

[查看好友设备] → 阶段4
```

**状态记录**: `onboarding.first_friend_added = true`

---

### 阶段 6: 查看好友的设备

**触发时机**: 添加第一个好友后

**Tips类型**: 引导提示

**页面**: `/app/friends/devices`

**视觉设计**:
```
┌────────────────────────────────────┐
│ 💡 好友的设备                       │
├────────────────────────────────────┤
│                                    │
│ 这里显示你的好友拥有的设备          │
│                                    │
│ 张三 (2个设备):                     │
│ ├─ 💻 MacBook Pro (在线)           │
│ └─ 🖥️ 家里的NAS (在线)              │
│                                    │
│ 你可以请求连接到这些设备            │
│ 连接建立后，你和张三的设备          │
│ 就可以互相访问了                    │
│                                    │
│ [知道了]                            │
└────────────────────────────────────┘
```

**关键说明**:
- 强调"设备↔设备"的连接
- 在线状态的意义
- 连接的前提是好友关系

**状态记录**: `onboarding.friends_devices_viewed = true`

---

### 阶段 7: 建立跨用户连接

**触发时机**: 用户查看好友设备后

**Tips类型**: 操作引导

**页面**: `/app/friends/devices` 或 `/app/connections`

**设计目标**: 引导用户建立第一个跨用户的设备连接

**引导步骤**:

**7.1 选择设备对**
```
┌────────────────────────────────────┐
│ 💡 建立跨用户连接                   │
├────────────────────────────────────┤
│                                    │
│ 与自己设备间的自动连接不同，         │
│ 跨用户连接需要双方确认               │
│                                    │
│ 第1步: 选择你的设备                │
│ [💻 我的MacBook  ▼]               │
│                                    │
│ 第2步: 选择好友的设备              │
│ [🖥️ 张三的NAS  ▼]                │
│                                    │
│ 连接建立后:                         │
│ • 你的MacBook可以访问张三的NAS      │
│ • 需要对方批准                      │
│ • 可以随时断开                      │
│                                    │
│ [发起连接请求]                      │
└────────────────────────────────────┘
```

**7.2 等待批准**
```
提示: "连接请求已发送给 [张三]"

等待对方批准:
- 张三会收到通知
- 他可以选择接受或拒绝
- 你会收到结果通知

[查看请求状态]
```

**7.3 跨用户连接建立成功**
```
┌────────────────────────────────────┐
│ 🎉 跨用户连接建立成功!              │
├────────────────────────────────────┤
│                                    │
│ 💻 我的MacBook ←→ 🖥️ 张三的NAS    │
│                                    │
│ 连接类型: 跨用户连接                │
│ 连接状态: 活跃 🟢                   │
│ 延迟: 23ms                          │
│                                    │
│ 💡 与自己设备的连接区别:            │
│                                    │
│ 自己设备间:                         │
│ ✓ 自动连接，无需批准                │
│ ✓ 默认互通，无法断开                │
│ ✓ 延迟极低                          │
│                                    │
│ 跨用户连接:                         │
│ ✓ 需要双方确认                      │
│ ✓ 可以随时断开                      │
│ ✓ 连接是设备↔设备级别的             │
│                                    │
│ [查看连接详情] [完成引导] → 阶段8   │
└────────────────────────────────────┘
```

**状态记录**: `onboarding.cross_user_connection_established = true`

---

### 阶段 8: 管理连接

旧阶段 5 的内容

**触发时机**: 用户查看好友设备后

**Tips类型**: 操作引导

**页面**: `/app/friends/devices` 或 `/app/connections`

**引导步骤**:

**5.1 选择设备对**
```
┌────────────────────────────────────┐
│ 💡 建立你的第一个连接               │
├────────────────────────────────────┤
│                                    │
│ 第1步: 选择你的设备                │
│ [📱 我的iPhone  ▼]                │
│                                    │
│ 第2步: 选择好友的设备              │
│ [💻 张三的MacBook  ▼]             │
│                                    │
│ 连接建立后，你的iPhone可以          │
│ 直接访问张三的MacBook              │
│                                    │
│ [发起连接请求]                      │
└────────────────────────────────────┘
```

**5.2 发送连接请求**
```
提示: "连接请求已发送给 [张三]"

等待对方批准:
- 张三会收到通知
- 他可以选择接受或拒绝
- 你会收到结果通知

[查看请求状态]
```

**5.3 连接建立成功**
```
┌────────────────────────────────────┐
│ 🎉 连接建立成功!                    │
├────────────────────────────────────┤
│                                    │
│ 📱 我的iPhone ←→ 💻 张三的MacBook  │
│                                    │
│ 连接状态: 活跃 🟢                   │
│ 延迟: 23ms                          │
│ 质量: 优秀                          │
│                                    │
│ 现在你可以:                         │
│ ✓ 传输文件                          │
│ ✓ 远程访问                          │
│ ✓ 共享资源                          │
│                                    │
│ [查看连接详情] [完成引导]           │
└────────────────────────────────────┘
```

**状态记录**: `onboarding.first_connection_established = true`

---

### 阶段 6: 管理连接

**触发时机**: 建立第一个跨用户连接后，进入连接管理页

**Tips类型**: 功能介绍

**页面**: `/app/connections`

**内容设计**:
```
┌────────────────────────────────────┐
│ 💡 连接管理                         │
├────────────────────────────────────┤
│                                    │
│ 在这里你可以:                       │
│                                    │
│ 📊 查看所有连接                     │
│   - 自己设备间的连接(自动)           │
│   - 跨用户连接(可管理)               │
│   - 待批准的请求                    │
│                                    │
│ 🔍 监控连接质量                     │
│   - 延迟和带宽                      │
│   - 流量统计                        │
│   - 连接稳定性                      │
│                                    │
│ ⚙️ 管理跨用户连接                   │
│   - 暂停/恢复连接                   │
│   - 断开连接                        │
│   - 批准/拒绝请求                   │
│                                    │
│ 💡 注意:                            │
│ 你自己设备间的连接无法管理，         │
│ 它们默认互通，这是设计如此           │
│                                    │
│ [知道了]                            │
└────────────────────────────────────┘
```

**强调重点**:
- 连接是可管理的
- 可以随时断开(P8原则)
- 拒绝请求也很简单(P9原则)

**状态记录**: `onboarding.connection_management_shown = true`

---

### 阶段 9: 进阶功能 (可选)

**触发时机**: 完成基础引导后，用户使用一段时间

**Tips类型**: 渐进式提示 (Tooltips)

**内容列表**:

**7.1 资源分享**
```
位置: /app/resources
提示: "你可以分享文件、服务给好友"
```

**7.2 多Zone管理**
```
位置: 顶部Zone切换器
提示: "你可以加入多个网络空间，通过这里切换"
注意: 仅在用户有多个Zone时显示
```

**7.3 邀请更多人**
```
位置: /app/friends/invite
提示: "生成邀请链接，邀请更多人加入"
```

**7.4 IP池管理 (高级)**
```
位置: /app/advanced/ippools
提示: "管理IP资源分配(高级功能)"
```

**状态记录**: `onboarding.advanced_features_shown = true`

---

## 🏗️ Tips系统架构

### 系统组件

```typescript
// Tips系统架构
TipsSystem
├── TipsEngine (核心引擎)
│   ├── 状态管理
│   ├── 触发检测
│   ├── 展示控制
│   └── 进度追踪
├── TipsComponents (UI组件)
│   ├── WelcomeModal (欢迎弹窗)
│   ├── SpotlightGuide (高亮引导)
│   ├── TooltipTip (工具提示)
│   ├── CardTip (卡片提示)
│   └── InlineTip (内联提示)
├── TipsContent (内容管理)
│   ├── 文案配置
│   ├── 多语言支持
│   └── 动态内容
└── TipsStorage (持久化)
    ├── LocalStorage
    ├── 服务器同步
    └── 进度恢复
```

### 数据模型

```typescript
// 用户引导状态
interface OnboardingState {
  userId: string
  version: string // 引导版本号
  
  // 整体进度
  completed: boolean
  currentStage: number
  startedAt: Date
  completedAt?: Date
  
  // 各阶段状态
  stages: {
    welcome_shown: boolean
    first_ippool_created: boolean // 阶段1：创建资源池
    first_device_added: boolean // 阶段2：添加第一个设备
    
    // 路径A: 体验自己设备连接
    second_device_added: boolean // 阶段3A：添加第二个设备
    auto_connection_understood: boolean // 阶段4A：理解自动连接
    
    // 路径B: 与邀请人建立连接
    inviter_friend_added: boolean // 阶段3B：与邀请人建立好友
    inviter_devices_viewed: boolean // 阶段4B：查看邀请人设备
    
    // 通用阶段
    first_friend_added: boolean // 添加其他好友
    friends_devices_viewed: boolean // 查看好友设备
    cross_user_connection_established: boolean // 建立跨用户连接
    connection_management_shown: boolean // 管理连接
    advanced_features_shown: boolean // 进阶功能
  }
  
  // 用户偏好
  preferences: {
    skipAll: boolean // 用户选择跳过全部
    showWelcome: boolean
    autoProgress: boolean // 自动推进到下一阶段
  }
  
  // 统计信息
  stats: {
    tipsShown: number
    tipsSkipped: number
    tipsCompleted: number
    averageTimePerStage: number[]
  }
}

// 单个Tip配置
interface TipConfig {
  id: string
  stage: number
  type: 'modal' | 'spotlight' | 'tooltip' | 'card' | 'inline'
  
  // 触发条件
  trigger: {
    route?: string // 特定路由
    condition?: () => boolean // 自定义条件
    once?: boolean // 只显示一次
    delay?: number // 延迟显示(ms)
  }
  
  // 展示配置
  display: {
    title: string
    content: string
    placement?: 'top' | 'bottom' | 'left' | 'right'
    target?: string // CSS选择器
    backdrop?: boolean // 是否显示遮罩
    highlight?: boolean // 是否高亮目标
  }
  
  // 交互配置
  actions: {
    primary?: {
      label: string
      action: () => void
    }
    secondary?: {
      label: string
      action: () => void
    }
    skip?: {
      label: string
      action: () => void
    }
  }
  
  // 元数据
  metadata: {
    priority: number
    dismissible: boolean
    persistent: boolean // 是否持久显示
  }
}
```

### 状态管理

使用 Pinia Store:

```typescript
// stores/onboarding.ts
import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useOnboardingStore = defineStore('onboarding', {
  state: (): OnboardingState => ({
    userId: '',
    version: '1.0.0',
    completed: false,
    currentStage: 0,
    startedAt: new Date(),
    stages: {
      welcome_shown: false,
      first_ippool_created: false,
      first_device_added: false,
      // 路径A
      second_device_added: false,
      auto_connection_understood: false,
      // 路径B
      inviter_friend_added: false,
      inviter_devices_viewed: false,
      // 通用
      first_friend_added: false,
      friends_devices_viewed: false,
      cross_user_connection_established: false,
      connection_management_shown: false,
      advanced_features_shown: false,
    },
    preferences: {
      skipAll: false,
      showWelcome: true,
      autoProgress: true,
    },
    stats: {
      tipsShown: 0,
      tipsSkipped: 0,
      tipsCompleted: 0,
      averageTimePerStage: [],
    }
  }),
  
  getters: {
    // 是否应该显示引导
    shouldShowOnboarding(): boolean {
      return !this.completed && !this.preferences.skipAll
    },
    
    // 当前阶段进度
    currentProgress(): number {
      const completedStages = Object.values(this.stages).filter(v => v).length
      const totalStages = Object.keys(this.stages).length
      return (completedStages / totalStages) * 100
    },
    
    // 是否完成基础引导
    basicOnboardingCompleted(): boolean {
      return this.stages.first_ippool_created &&
             this.stages.first_device_added &&
             this.stages.second_device_added &&
             this.stages.first_friend_added &&
             this.stages.cross_user_connection_established
    }
  },
  
  actions: {
    // 标记阶段完成
    completeStage(stage: keyof OnboardingState['stages']) {
      this.stages[stage] = true
      this.stats.tipsCompleted++
      this.saveToStorage()
      
      // 检查是否全部完成
      if (this.basicOnboardingCompleted) {
        this.markAsCompleted()
      }
    },
    
    // 跳过引导
    skipOnboarding() {
      this.preferences.skipAll = true
      this.saveToStorage()
    },
    
    // 重置引导
    resetOnboarding() {
      Object.keys(this.stages).forEach(key => {
        this.stages[key as keyof OnboardingState['stages']] = false
      })
      this.completed = false
      this.currentStage = 0
      this.saveToStorage()
    },
    
    // 标记完成
    markAsCompleted() {
      this.completed = true
      this.completedAt = new Date()
      this.saveToStorage()
    },
    
    // 持久化
    saveToStorage() {
      LocalStorage.set('onboarding_state', this.$state)
    },
    
    // 从存储加载
    loadFromStorage() {
      const saved = LocalStorage.getItem('onboarding_state')
      if (saved) {
        this.$patch(saved)
      }
    }
  }
})
```

---

## 🎨 交互设计

### Tips 视觉样式

**1. 欢迎弹窗 (Modal)**
```scss
.welcome-modal {
  max-width: 500px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px;
  }
  
  .content {
    padding: 24px;
    line-height: 1.6;
  }
  
  .actions {
    padding: 16px 24px;
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}
```

**2. 高亮引导 (Spotlight)**
```scss
.spotlight-guide {
  position: relative;
  z-index: 9999;
  
  // 遮罩层
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(2px);
  }
  
  // 高亮区域
  .highlight {
    position: relative;
    z-index: 10000;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.5),
                0 0 0 9999px rgba(0, 0, 0, 0.7);
    border-radius: 8px;
  }
  
  // 提示气泡
  .tip-bubble {
    position: absolute;
    max-width: 320px;
    background: white;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    
    // 箭头
    &::before {
      content: '';
      position: absolute;
      width: 0;
      height: 0;
      border: 8px solid transparent;
    }
  }
}
```

**3. 工具提示 (Tooltip)**
```scss
.tooltip-tip {
  background: #2d3748;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  max-width: 200px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  .arrow {
    width: 8px;
    height: 8px;
    background: #2d3748;
    transform: rotate(45deg);
  }
}
```

**4. 卡片提示 (Card)**
```scss
.card-tip {
  background: #f7fafc;
  border-left: 4px solid #667eea;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  
  .icon {
    font-size: 24px;
    margin-right: 12px;
  }
  
  .content {
    flex: 1;
    
    .title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .description {
      color: #4a5568;
      font-size: 14px;
    }
  }
  
  .close-btn {
    opacity: 0.6;
    cursor: pointer;
    
    &:hover {
      opacity: 1;
    }
  }
}
```

### 动画效果

```scss
// 淡入动画
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 脉冲高亮
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
}

.tip-enter-active {
  animation: fadeIn 0.3s ease-out;
}

.highlight-element {
  animation: pulse 2s infinite;
}
```

---

## 🔧 技术实现方案

### 核心组件实现

**TipsEngine.ts**
```typescript
import { useOnboardingStore } from '@/stores/onboarding'
import { useAuthStore } from '@/stores/auth'
import { watch, computed } from 'vue'
import { useRoute } from 'vue-router'

export class TipsEngine {
  private store = useOnboardingStore()
  private authStore = useAuthStore()
  private route = useRoute()
  private tipConfigs: Map<string, TipConfig> = new Map()
  
  constructor() {
    this.initialize()
  }
  
  // 初始化
  initialize() {
    this.store.loadFromStorage()
    this.registerTips()
    this.setupWatchers()
  }
  
  // 注册所有Tips
  registerTips() {
    // 阶段0: 欢迎
    this.registerTip({
      id: 'welcome',
      stage: 0,
      type: 'modal',
      trigger: {
        route: '/app/dashboard',
        condition: () => !this.store.stages.welcome_shown,
        once: true,
        delay: 500
      },
      display: {
        title: '🎉 欢迎加入 MyNet!',
        content: '你已通过邀请加入这个网络。接下来我们将引导你添加设备、添加好友、建立连接。',
      },
      actions: {
        primary: {
          label: '开始引导',
          action: () => this.startOnboarding()
        },
        secondary: {
          label: '稍后再说',
          action: () => this.dismissTip('welcome')
        }
      },
      metadata: {
        priority: 10,
        dismissible: true,
        persistent: false
      }
    })
    
    // 阶段1: 添加设备
    this.registerTip({
      id: 'add_first_device',
      stage: 1,
      type: 'spotlight',
      trigger: {
        route: '/app/devices',
        condition: () => !this.store.stages.first_device_added && this.authStore.user?.device_count === 0,
        once: true
      },
      display: {
        title: '💡 第一步: 添加设备',
        content: '添加你的电脑、手机或服务器，让它们可以被好友连接',
        target: '[data-tip-target="add-device-btn"]',
        placement: 'bottom',
        backdrop: true,
        highlight: true
      },
      actions: {
        primary: {
          label: '点击添加',
          action: () => this.highlightAndWait('[data-tip-target="add-device-btn"]')
        },
        skip: {
          label: '跳过',
          action: () => this.skipStage(1)
        }
      },
      metadata: {
        priority: 9,
        dismissible: true,
        persistent: false
      }
    })
    
    // 阶段2.5: 创建资源池
    this.registerTip({
      id: 'create_first_ippool',
      stage: 2.5,
      type: 'spotlight',
      trigger: {
        route: '/app/advanced/ippools',
        condition: () => !this.store.stages.first_ippool_created && 
                        this.store.stages.first_device_added,
        once: true
      },
      display: {
        title: '💡 创建IP资源池',
        content: '资源池用于管理IP地址，为你的设备分配网络资源。这是连接的基础设施。',
        target: '[data-tip-target="create-ippool-btn"]',
        placement: 'bottom',
        backdrop: true,
        highlight: true
      },
      actions: {
        primary: {
          label: '开始创建',
          action: () => this.highlightAndWait('[data-tip-target="create-ippool-btn"]')
        },
        secondary: {
          label: '了解更多',
          action: () => this.showIpPoolHelp()
        }
      },
      metadata: {
        priority: 8,
        dismissible: true,
        persistent: false
      }
    })
    
    // ... 更多Tips配置
  }
  
  // 监听状态变化
  setupWatchers() {
    // 监听路由变化
    watch(() => this.route.path, (newPath) => {
      this.checkTipsForRoute(newPath)
    })
    
    // 监听资源池数量变化
    watch(() => this.authStore.user?.ippool_count, (count) => {
      if (count >= 1 && !this.store.stages.first_ippool_created) {
        this.store.completeStage('first_ippool_created')
        this.showNextTip()
      }
    })
    
    // 监听设备数量变化
    watch(() => this.authStore.user?.device_count, (count) => {
      if (count === 1 && !this.store.stages.first_device_added) {
        this.store.completeStage('first_device_added')
        this.showNextTip()
      } else if (count >= 2 && !this.store.stages.second_device_added) {
        this.store.completeStage('second_device_added')
        // 第二个设备会自动建立连接
        this.showAutoConnectionTip()
      }
    })
    
    // 监听好友数量变化
    watch(() => this.authStore.user?.friend_count, (count) => {
      if (count === 1 && !this.store.stages.first_friend_added) {
        this.store.completeStage('first_friend_added')
        this.showNextTip()
      }
    })
  }
  
  // 检查路由对应的Tips
  checkTipsForRoute(route: string) {
    this.tipConfigs.forEach((config, id) => {
      if (config.trigger.route === route && this.shouldShowTip(config)) {
        if (config.trigger.delay) {
          setTimeout(() => this.showTip(id), config.trigger.delay)
        } else {
          this.showTip(id)
        }
      }
    })
  }
  
  // 判断是否应该显示Tip
  shouldShowTip(config: TipConfig): boolean {
    if (!this.store.shouldShowOnboarding) return false
    if (config.trigger.once && this.hasSeen(config.id)) return false
    if (config.trigger.condition && !config.trigger.condition()) return false
    return true
  }
  
  // 显示Tip
  showTip(id: string) {
    const config = this.tipConfigs.get(id)
    if (!config) return
    
    // 触发显示事件
    window.dispatchEvent(new CustomEvent('show-tip', { 
      detail: { config } 
    }))
    
    this.store.stats.tipsShown++
    this.store.saveToStorage()
  }
  
  // 开始引导流程
  startOnboarding() {
    this.store.completeStage('welcome_shown')
    // 导航到设备页面
    this.$router.push('/app/devices')
  }
  
  // 其他辅助方法...
}

// 创建全局实例
export const tipsEngine = new TipsEngine()
```

**TipsContainer.vue** (全局容器组件)
```vue
<template>
  <div class="tips-container">
    <!-- 欢迎弹窗 -->
    <WelcomeModal
      v-if="currentTip?.type === 'modal'"
      :config="currentTip"
      @close="handleClose"
      @action="handleAction"
    />
    
    <!-- 高亮引导 -->
    <SpotlightGuide
      v-if="currentTip?.type === 'spotlight'"
      :config="currentTip"
      @close="handleClose"
      @action="handleAction"
    />
    
    <!-- 其他Tip类型组件... -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import WelcomeModal from './WelcomeModal.vue'
import SpotlightGuide from './SpotlightGuide.vue'

const currentTip = ref<TipConfig | null>(null)

const handleShowTip = (event: CustomEvent) => {
  currentTip.value = event.detail.config
}

const handleClose = () => {
  currentTip.value = null
}

const handleAction = (actionType: string) => {
  // 执行相应操作
}

onMounted(() => {
  window.addEventListener('show-tip', handleShowTip as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('show-tip', handleShowTip as EventListener)
})
</script>
```

### 在页面中添加Tip目标

```vue
<!-- DeviceListPage.vue -->
<template>
  <PageLayout title="我的设备">
    <template #actions>
      <q-btn
        data-tip-target="add-device-btn"
        color="primary"
        icon="add"
        label="添加设备"
        @click="showAddDevice"
      />
    </template>
    
    <!-- 设备列表 -->
    <DeviceList :devices="devices" />
  </PageLayout>
</template>
```

---

## 📊 效果评估

### 关键指标

1. **完成率**:
   - 开始引导的用户中，完成基础引导的比例
   - 目标: >70%

2. **各阶段通过率**:
   - 创建资源池: >90%
   - 添加第一个设备: >85%
   - 添加第二个设备: >75%
   - 添加好友: >70%
   - 建立跨用户连接: >65%

3. **时间效率**:
   - 完成基础引导的平均时间
   - 目标: <10分钟

4. **跳过率**:
   - 选择跳过引导的比例
   - 目标: <30%

5. **重复查看率**:
   - 用户主动重新查看引导的比例
   - 目标: >15%

### 优化迭代

根据数据反馈持续优化:
- A/B测试不同的文案和流程
- 调整Tips出现的时机
- 优化交互动画
- 改进内容说明

---

## 🎯 实施优先级

### P0 - 必须实现

1. ✅ 基础引导流程 (阶段0-5)
2. ✅ 状态管理和持久化
3. ✅ 欢迎弹窗
4. ✅ 高亮引导组件
5. ✅ 进度追踪

### P1 - 重要功能

6. 卡片提示组件
7. 工具提示组件
8. 引导重置功能
9. 帮助中心集成
10. 多语言支持

### P2 - 优化改进

11. 进阶功能引导 (阶段7)
12. 引导数据分析
13. 个性化推荐
14. 动画效果优化
15. 移动端适配

---

## 📝 附录

### A. 文案清单

所有引导文案的完整列表，支持多语言配置。

### B. 设计规范

Tips组件的详细设计规范和使用指南。

### C. 测试用例

引导系统的完整测试用例和验收标准。

---

**文档状态**: 设计方案 v1.0  
**配合文档**: [PRODUCT_CONNECTION_OPTIMIZATION_PLAN.md](PRODUCT_CONNECTION_OPTIMIZATION_PLAN.md)  
**下一步**: 技术实施方案和开发排期
