# "节点" → "设备" UI术语更新报告

## 📋 更新概述

本次更新将中文UI界面中的"节点"统一替换为"设备"，使产品术语更贴近普通用户的理解。

**更新文件**: `src/i18n/zh-CN.ts`  
**更新时间**: 2024  
**更新类型**: UI显示文本（i18n）  
**代码影响**: 无，仅修改用户界面显示文本

---

## ✅ 更新统计

- **总更新数量**: 约 150+ 处
- **涉及模块**: 12个主要模块
- **i18n键名**: 保持不变（仅更新值）
- **代码变量**: 保持不变（继续使用node）

---

## 📦 模块更新明细

### 1. **通用模块 (Common)**
```typescript
common: {
  nodes: '设备',  // 原：'节点'
}
```
- 全局导航菜单
- 通用状态标签

### 2. **仪表盘 (Dashboard)**
```typescript
dashboard: {
  stats: {
    totalNodes: '总设备数',      // 原：'总节点数'
    onlineNodes: '在线设备',     // 原：'在线节点'
    offlineNodes: '离线设备',    // 原：'离线节点'
  },
  warnings: {
    noNodes: '暂无设备，请先创建设备',  // 原：'暂无节点，请先创建节点'
    offlineNodes: '{count} 个设备离线',
    unconfiguredNodes: '{count} 个设备未配置',
  }
}
```
- 统计卡片
- 警告提示
- 快速操作入口

### 3. **设备管理 (Nodes)**
```typescript
nodes: {
  title: '设备管理',              // 原：'节点管理'
  createNode: '创建设备',         // 原：'创建节点'
  deleteNode: '删除设备',         // 原：'删除节点'
  
  edit: {
    basic: {
      nodeVirtualIP: '设备虚拟IP',     // 原：'节点虚拟IP'
      selectIPFromPool: '从IP池中选择一个可用的IP地址作为设备的虚拟IP'
    }
  },
  
  detail: {
    deleteNodeFailed: '删除设备失败，请重试'  // 原：'删除节点失败'
  }
}
```
- 设备列表
- 创建/编辑表单
- 设备详情页
- 配置管理
- 状态监控

### 4. **连接管理 (Routes)**
```typescript
routes: {
  connectionDetails: {
    nodeInfo: '设备信息',          // 原：'节点信息'
    sourceNode: '源设备',          // 原：'源节点'
    targetNode: '目标设备',        // 原：'目标节点'
  },
  
  create: {
    steps: {
      selectFriendNode: '选择好友设备',  // 原：'选择好友节点'
      selectMyNode: '选择我的设备',      // 原：'选择我的节点'
    },
    
    step2: {
      title: '创建连接 - 选择好友设备',
      noNodes: '该好友暂无可用设备',
      nodeNotAvailable: '设备不可用',
      cannotConnect: '无法连接到此设备',
    },
    
    step3: {
      selectMyNode: '选择我的设备',
      noAvailableNodes: '暂无可用设备',
      nodeAlreadyConnected: '该设备已与目标设备建立连接',
      nodeNotAvailable: '设备暂时不可用',
      nodeUnconfigured: '设备未配置',
      nodeDisabled: '设备已禁用',
      nodeMaintenance: '设备维护中'
    },
    
    step4: {
      targetNode: '目标设备',
      sourceNode: '源设备',
      defaultMessage: '您好 {friendName}，我希望将我的设备 {myNode} 与您的设备 {friendNode} 建立连接...'
    }
  },
  
  friendNodes: {
    stats: {
      totalNodes: '设备总数',
      onlineNodes: '在线设备',
      offlineNodes: '离线设备'
    }
  },
  
  nodeBased: {
    selectNode: '选择我的设备',
    noNodes: '暂无设备',
    nodeList: '设备列表'
  },
  
  dialogs: {
    connectNode: {
      title: '连接设备',
      message: '您要连接到 {friendName} 的设备 {nodeName}...'
    }
  }
}
```
- 连接列表
- 创建连接向导（4步流程）
- 好友设备浏览
- 基于设备的连接管理
- 连接详情

### 5. **社交模块 (Social)**
```typescript
social: {
  overview: {
    connectedNodes: '已连接设备'  // 原：'已连接节点'
  },
  
  friends: {
    nodes: '设备',              // 原：'节点'
    viewNodes: '查看设备'       // 原：'查看节点'
  },
  
  errors: {
    noFriendNodes: '该好友暂无设备',
    fetchFriendNodesError: '获取好友设备失败'
  }
}
```
- 社交概览
- 好友列表
- 好友设备查看

### 6. **区域管理 (Zones)**
```typescript
zones: {
  stats: {
    totalNodes: '总设备数',     // 原：'总节点数'
    activeNodes: '活跃设备'     // 原：'活跃节点'
  }
}
```
- Zone统计信息

### 7. **IP池管理 (IPPools)**
```typescript
ippools: {
  nodeLabel: '设备',                        // 原：'节点'
  nodeHint: '选择要分配IP的设备',          // 原：'选择要分配IP的节点'
  allocatedToNodes: '已使用分配IP数'        // 保持不变（已经是正确的）
}
```
- IP分配表单
- 分配历史记录

### 8. **服务管理 (Services)**
```typescript
services: {
  types: {
    gnbIndexDesc: 'GNB设备索引服务'  // 原：'GNB节点索引服务'
  },
  
  form: {
    associatedNode: '关联设备',      // 原：'关联节点'
  },
  
  serviceCard: {
    nodeLabel: '设备'                // 原：'节点'
  }
}
```
- 服务列表
- 服务创建表单

### 9. **VPN配置 (VPN)**
```typescript
vpn: {
  config: {
    nodeId: '设备ID'  // 原：'节点ID'
  }
}
```
- VPN配置参数

### 10. **用户模块 (User)**
```typescript
user: {
  statistics: {
    totalNodes: '设备总数'  // 原：'节点总数'
  }
}
```
- 用户统计信息

### 11. **导航组件 (Navigation)**
```typescript
navigation: {
  nodes: '设备管理',      // 原：'节点管理'
  friendNodes: '好友设备' // 原：'好友节点'
}
```
- 主导航菜单
- 侧边栏

### 12. **错误消息**
```typescript
// Routes模块错误
fetchFriendNodesError: '获取好友设备失败',
fetchAllFriendNodesError: '获取所有好友设备失败',

// Social模块错误  
noFriendNodes: '该好友暂无设备',
fetchFriendNodesError: '获取好友设备失败'
```

---

## 🎯 更新原则

### 一致性原则
- ✅ **用户界面**: 统一使用"设备"
- ✅ **代码层面**: 继续使用"node"（变量名、函数名等）
- ✅ **i18n键名**: 保持不变（如`nodes.title`）
- ✅ **API接口**: 不受影响

### 示例对比

#### ✅ 正确的更新方式
```typescript
// i18n键名保持不变，只更新值
nodes: {
  title: '设备管理',        // ✅ 只改显示文本
  createNode: '创建设备'    // ✅ 只改显示文本
}
```

#### ❌ 错误的做法（未采用）
```typescript
// ❌ 不要修改键名
devices: {  // ❌ 错误：键名改变会破坏代码
  title: '设备管理'
}

// ❌ 不要修改变量名
const deviceList = []  // ❌ 错误：破坏现有代码
```

---

## 🔍 验证方法

### 1. 搜索验证
```bash
# 确认zh-CN.ts中无遗漏的"节点"
grep "节点" src/i18n/zh-CN.ts
# 结果：无匹配（✅ 验证通过）
```

### 2. UI测试页面
建议测试以下页面确认显示正确：

- [ ] 仪表盘 - 统计卡片显示"设备"
- [ ] 设备管理 - 列表标题、按钮文本
- [ ] 创建设备 - 表单标签、提示文本
- [ ] 设备详情 - 配置项标签
- [ ] 连接管理 - 创建连接向导（4步流程）
- [ ] 好友设备 - 列表显示
- [ ] 错误提示 - 各类错误消息

### 3. 功能验证
- [ ] 创建设备功能正常
- [ ] 编辑设备功能正常
- [ ] 删除设备功能正常
- [ ] 创建连接向导流程正常
- [ ] 好友设备查看正常

---

## 📊 影响范围

### ✅ 已更新
- 中文UI界面显示文本（zh-CN.ts）
- 所有用户可见的标签、按钮、提示、错误消息

### ⏳ 待更新（后续工作）
- 英文语言包（src/i18n/en-US.ts）
  - "nodes" → "devices"
  - "routes" → "connections"

### ❌ 不受影响
- TypeScript代码逻辑
- Vue组件变量名
- API接口定义
- 数据库字段名
- 路由配置

---

## 🎨 术语对照表

| 旧术语 | 新术语 | 英文 | 使用场景 |
|--------|--------|------|----------|
| 节点 | 设备 | Node/Device | 所有UI显示 |
| 节点管理 | 设备管理 | Node Management | 导航菜单 |
| 创建节点 | 创建设备 | Create Node | 操作按钮 |
| 总节点数 | 总设备数 | Total Nodes | 统计数据 |
| 在线节点 | 在线设备 | Online Nodes | 状态显示 |
| 节点信息 | 设备信息 | Node Info | 详情页标题 |
| 源节点 | 源设备 | Source Node | 连接详情 |
| 目标节点 | 目标设备 | Target Node | 连接详情 |
| 好友节点 | 好友设备 | Friend Nodes | 社交功能 |
| 节点ID | 设备ID | Node ID | 配置参数 |

---

## 💡 技术说明

### 为什么只改UI不改代码？

1. **最小影响原则**
   - 避免大规模代码重构
   - 降低引入bug的风险
   - 保持API兼容性

2. **i18n最佳实践**
   - 内部逻辑用技术术语（node）
   - 用户界面用通俗术语（设备）
   - 通过i18n分离两者

3. **可维护性**
   - 术语调整只需修改语言文件
   - 不影响业务逻辑代码
   - 便于多语言支持

### 关键技术点

```typescript
// 代码中继续使用node
interface NodeConfig {
  nodeId: string;
  nodeName: string;
}

// UI显示时通过i18n转换
<div>{{ $t('nodes.title') }}</div>
// 渲染结果: "设备管理"
```

---

## 📝 后续工作

### 1. 英文语言包更新 (en-US.ts)
需要将对应的英文术语同步更新：
- nodes → devices（在合适的上下文）
- routes → connections
- 注意：技术文档中可能仍保留"node"

### 2. 文档更新
- 用户手册
- 在线帮助
- 快速入门指南
- FAQ

### 3. 验收测试
- UI文本一致性检查
- 功能回归测试
- 用户体验反馈收集

---

## ✨ 总结

本次更新成功将中文UI界面中的"节点"统一替换为"设备"，共涉及约150+处文本修改，覆盖12个主要功能模块。更新遵循最小影响原则，仅修改i18n显示文本，不影响代码逻辑和API接口，确保系统稳定性的同时提升了用户体验。

**核心价值**：
- 🎯 术语更贴近普通用户理解
- 🔒 代码稳定性不受影响  
- 🌍 为多语言支持打好基础
- 📈 提升产品易用性

---

*更新完成时间：2024*  
*更新执行：GitHub Copilot*
