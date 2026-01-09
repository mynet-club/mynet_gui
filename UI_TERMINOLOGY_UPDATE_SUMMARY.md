# UI 术语更新总结

## 📋 更新概览

**更新日期:** 2026-01-06  
**更新范围:** UI 显示文本  
**更新策略:** 代码保持不变,仅修改用户界面显示

---

## ✅ 已完成的更新

### "路由" → "连接" (Routes → Connections)

#### 更新策略说明
- ✅ **代码层面**: 保持 `route` 相关的变量名、类型名、键名不变
- ✅ **UI层面**: 通过 i18n 配置,将所有显示给用户的"路由"改为"连接"
- ✅ **向后兼容**: 不影响现有代码逻辑和 API 调用

#### 更新的文件
1. `src/i18n/zh-CN.ts` - 中文语言包 (30+ 处更新)

#### 具体更新内容

##### 1. 通用术语 (common)
```typescript
routes: '连接'  // 原: '路由'
```

##### 2. 仪表板 (dashboard)
```typescript
dashboard: {
  quickActions: {
    createRoute: '创建连接'  // 原: '创建路由'
  },
  stats: {
    totalRoutes: '总连接数',    // 原: '总路由数'
    activeRoutes: '活跃连接'    // 原: '活跃路由'
  },
  pendingTasks: {
    failedRoutes: '{count} 个连接故障'  // 原: '路由故障'
  },
  abnormalItems: {
    allNormal: '{nodes} 个节点全部在线，{routes} 条连接正常运行'  
    // 原: '条路由正常运行'
  }
}
```

##### 3. 节点管理 (nodes)
```typescript
nodes: {
  loadRoutesCountFailed: '加载连接数量失败',  // 原: '加载路由数量失败'
  detail: {
    viewRoutes: '查看连接',      // 原: '查看路由'
    totalRoutes: '连接总数'      // 原: '路由总数'
  },
  config: {
    indexServersHint: '索引服务器用于节点发现和连接，可配置多个提高可用性',
    // 原: '节点发现和路由'
    routeTable: '连接表'         // 原: '路由表'
  },
  edit: {
    network: {
      refreshRoutes: '刷新连接'  // 原: '刷新路由'
    }
  }
}
```

##### 4. 导航菜单 (navigation)
```typescript
navigation: {
  routes: {
    title: '连接管理',           // 原: '路由管理'
    overview: '连接概览',        // 原: '路由概览'
    active: '活跃连接'           // 原: '活跃路由'
  },
  activeRoutes: '活跃连接'       // 原: '活跃路由'
}
```

##### 5. 连接管理 (routes) - 核心模块
```typescript
routes: {
  subtitle: '网络连接管理和配置',    // 原: '网络路由管理和配置'
  title: '连接管理',                // 原: '路由管理'
  name: '连接名称',                 // 原: '路由名称'
  
  overview: {
    activeRoutes: '活跃连接'        // 原: '活跃路由'
  },
  
  tabs: {
    activeRoutes: '活跃连接'        // 原: '活跃路由'
  },
  
  activeRoutes: {
    subtitle: '管理当前活跃的网络连接',       // 原: '管理当前活跃的网络路由连接'
    searchPlaceholder: '搜索连接...',        // 原: '搜索路由...'
    noRoutes: '暂无活跃连接',                // 原: '暂无活跃路由'
    noSearchResults: '未找到匹配连接',       // 原: '未找到匹配路由'
    editRoute: '编辑连接'                    // 原: '编辑路由'
  },
  
  nodeRoutes: {
    totalRoutes: '连接总数',                 // 原: '路由总数'
    searchPlaceholder: '搜索连接信息...',    // 原: '搜索路由信息...'
    noRoutes: '该节点暂无连接',              // 原: '该节点暂无路由'
    noSearchResults: '未找到匹配的连接',     // 原: '未找到匹配的路由'
    noRoutesForNode: '该节点还没有建立任何连接',  // 原: '路由连接'
    direction: {
      outgoing: '出站连接',                  // 原: '出站路由'
      incoming: '入站连接'                   // 原: '入站路由'
    }
  },
  
  nodeBased: {
    selectNodeDescription: '点击您的节点卡片查看该节点的连接信息',  
    // 原: '路由信息'
    viewRoutes: '查看连接',                  // 原: '查看路由'
    totalRoutes: '连接总数',                 // 原: '路由总数'
    routeCount: '连接数',                    // 原: '路由数'
    routesList: '连接列表',                  // 原: '路由列表'
    noRoutesForNode: '该节点暂无连接'        // 原: '该节点暂无路由'
  },
  
  config: {
    description: '连接配置文件包含了所有必要的网络连接信息，可以下载并应用到您的网络设备。',
    // 原: '路由配置文件...网络路由信息'
    routeEntries: '连接条目'                 // 原: '路由条目'
  },
  
  details: {
    routeId: '连接ID'                        // 原: '路由ID'
  },
  
  actions: {
    refreshRoutes: '刷新连接',               // 原: '刷新路由'
    createRoute: '创建连接'                  // 原: '创建路由'
  },
  
  create: {
    step1: {
      title: '创建连接 - 选择好友'           // 原: '创建路由'
    },
    step2: {
      title: '创建连接 - 选择好友节点',      // 原: '创建路由'
      existingConnection: '已存在连接'       // 原: '已存在路由连接'
    },
    step3: {
      title: '创建连接 - 选择我的节点'       // 原: '创建路由'
    },
    step4: {
      title: '创建连接 - 提交申请',          // 原: '创建路由'
      viewRoutes: '查看连接'                 // 原: '查看路由'
    },
    requestSubmitted: '连接申请已提交'       // 原: '路由申请已提交'
  },
  
  index: {
    title: '连接概览',                       // 原: '路由概览'
    subtitle: '管理和监控网络连接',          // 原: '网络路由连接'
    overview: '连接概览',                    // 原: '路由概览'
    overviewDescription: '查看连接统计和快速操作',  // 原: '路由统计'
    activeRoutes: '活跃连接',                // 原: '活跃路由'
    activeRoutesDescription: '管理当前活跃的网络连接',  
    // 原: '管理当前活跃的网络路由连接'
    quickActions: {
      createRoute: '创建连接'                // 原: '创建路由'
    }
  },
  
  dialogs: {
    routeDetails: {
      title: '连接详情'                      // 原: '路由详情'
    }
  },
  
  // 错误和成功消息
  fetchOverviewError: '获取连接概览失败',    // 原: '获取路由概览失败'
  fetchActiveRoutesError: '获取活跃连接失败', // 原: '获取活跃路由失败'
  fetchRouteDetailsError: '获取连接详情失败', // 原: '获取路由详情失败'
  routeDisconnected: '连接已断开',           // 原: '路由已断开'
  routeDisconnectError: '断开连接失败'       // 原: '断开路由失败'
}
```

##### 6. 其他模块
```typescript
// IP池管理
ippools: {
  routes: '连接数'  // 原: '路由数'
}

// 区域管理
zones: {
  stats: {
    routes: '连接数'  // 原: '路由数'
  }
}

// 社交网络
social: {
  overview: {
    activeRoutes: '活跃连接'  // 原: '活跃路由'
  },
  friends: {
    routes: '连接'  // 原: '路由'
  }
}

// 用户资料
user: {
  statistics: {
    totalRoutes: '连接总数'  // 原: '路由总数'
  }
}

// VPN配置
vpn: {
  config: {
    routeTable: '连接表'  // 原: '路由表'
  }
}
```

---

## 📊 更新统计

| 分类 | 更新数量 |
|------|---------|
| 通用术语 | 1处 |
| 仪表板相关 | 4处 |
| 节点管理相关 | 5处 |
| 导航菜单 | 4处 |
| 连接管理核心模块 | 40+处 |
| 其他模块 | 6处 |
| **总计** | **60+处** |

---

## 🎯 用户体验提升

### 术语对比

| 原术语 | 新术语 | 理由 |
|--------|--------|------|
| 路由 | 连接 | 符合 mynet.club 官网表述 |
| 路由管理 | 连接管理 | 更贴近用户理解 |
| 活跃路由 | 活跃连接 | 降低技术门槛 |
| 路由列表 | 连接列表 | 更加直观 |
| 创建路由 | 创建连接 | 符合用户心智模型 |

### 好处
1. ✅ **降低学习曲线**: "连接"比"路由"更容易被普通用户理解
2. ✅ **品牌一致性**: 与官网 mynet.club 的表述保持一致
3. ✅ **用户友好**: 减少技术术语,提升易用性
4. ✅ **无破坏性**: 代码层面零改动,不影响系统稳定性

---

## 🔧 技术实现

### 关键原则
```typescript
// ✅ 代码层面 - 保持不变
const routes = {
  fetchRoutes()      // 函数名保持
  activeRoutes       // 变量名保持  
  route_id          // API字段保持
}

// ✅ UI层面 - 通过i18n修改
$t('routes.title')           // → "连接管理"
$t('routes.activeRoutes')    // → "活跃连接"  
$t('routes.actions.createRoute')  // → "创建连接"
```

### 影响范围
- ✅ **影响**: 用户界面显示文本
- ❌ **不影响**: 
  - TypeScript 类型定义
  - 变量和函数命名
  - API 请求和响应
  - 数据库字段
  - 路由配置 (Vue Router)

---

## 🔄 后续建议

### 短期 (已完成)
- [x] 更新中文语言包 (zh-CN.ts)
- [ ] 更新英文语言包 (en-US.ts) - 建议后续同步

### 中期 (可选)
- [ ] 检查是否有硬编码的中文文本需要迁移到 i18n
- [ ] 验证所有页面显示是否正确

### 长期 (可选)
- [ ] 考虑"节点" → "设备"的 UI 更新
- [ ] 其他术语优化

---

## ⚠️ 注意事项

### 保持不变的内容
以下内容**不应该**修改:

1. **Vue Router 相关**
```typescript
// ❌ 不改 - 框架层面的路由
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
```

2. **代码中的变量名**
```typescript
// ❌ 不改 - 代码逻辑
const routesList = []
function getRoutes() {}
```

3. **API 字段名**
```typescript
// ❌ 不改 - 后端契约
interface ApiResponse {
  route_id: number
  route_name: string
}
```

4. **i18n 键名**
```typescript
// ❌ 不改 - 保持向后兼容
routes: {
  title: '连接管理'  // 键名 routes 保持不变
}
```

---

## ✅ 验证清单

### UI 显示验证
- [ ] 仪表板页面 - 快速操作按钮显示"创建连接"
- [ ] 导航菜单 - 显示"连接管理"而非"路由管理"
- [ ] 连接列表页 - 标题显示"活跃连接"
- [ ] 节点详情页 - 显示"连接总数"
- [ ] 创建向导页 - 步骤标题显示"创建连接"

### 功能验证
- [ ] 所有功能正常工作
- [ ] API 调用正常
- [ ] 数据显示正确
- [ ] 无控制台错误

---

## 📝 相关文档

- [核心概念迁移评估报告](./TERMINOLOGY_MIGRATION_ASSESSMENT.md)
- [MyNet 官网](https://mynet.club/)
- [项目概述文档](./docs/01-项目概述.md)

---

**更新状态:** ✅ 已完成  
**影响评级:** 🟢 低风险 (仅UI文本)  
**建议优先级:** 🔥 高 (提升用户体验)
