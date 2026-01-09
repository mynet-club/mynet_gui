# 集成验证清单

> 快速验证Tips系统是否正确集成

**日期**: 2026-01-06  
**状态**: 已集成，待测试

---

## ✅ 已完成的集成工作

### 1. MainLayout集成 ✅
- ✅ 导入TipsContainer组件
- ✅ 导入useOnboardingStore和getTipsEngine
- ✅ 在template中添加`<TipsContainer />`
- ✅ 在onMounted中初始化引导系统
- ✅ 添加调试日志

**文件**: `src/layouts/MainLayout.vue`

### 2. App.vue开发工具 ✅
- ✅ 添加$tips全局调试对象
- ✅ 实现reset(), status(), export()等方法
- ✅ 在控制台显示使用提示

**文件**: `src/App.vue`

### 3. 目标元素标记 ✅
- ✅ IP资源池创建按钮: `data-tip-target="create-ippool-btn"`
- ✅ 节点添加按钮: `data-tip-target="add-device-btn"`

**文件**: 
- `src/pages/ippool/IpPoolListPage.vue`
- `src/pages/node/NodeListPage.vue`

---

## 🧪 测试步骤

### 第1步：启动开发服务器

```bash
cd /Users/arthur/Devel/WorkSpacePHP/lyt.com/mynet_gui
npm run dev
# 或
yarn dev
```

### 第2步：打开浏览器

访问: `http://localhost:9000` (或你的开发端口)

### 第3步：登录系统

使用测试账号登录

### 第4步：打开浏览器控制台

按 F12 或 Cmd+Option+I (Mac)

**预期看到**:
```
💡 开发者工具已加载
使用 $tips 访问引导系统调试工具：
  $tips.reset()          - 重置引导
  $tips.status()         - 查看状态
  ...
```

### 第5步：查看引导状态

在控制台输入:
```javascript
$tips.status()
```

**预期输出**:
```
┌──────────┬───────────────┐
│ 用户ID   │ 1             │
│ 是否完成 │ false         │
│ 当前阶段 │ 0             │
│ 进度     │ 0%            │
│ 选择路径 │ none          │
└──────────┴───────────────┘
阶段详情: { welcome_shown: false, ... }
```

### 第6步：重置引导（如果需要）

```javascript
$tips.reset()
```

这会刷新页面并重置所有引导状态。

### 第7步：验证欢迎弹窗

**预期**: 
- 首次登录或重置后，应该在Dashboard显示欢迎弹窗
- 弹窗标题: "👋 欢迎来到 MyNet"
- 有"开始使用"和"跳过引导"两个按钮

### 第8步：验证IP资源池高亮

1. 点击欢迎弹窗的"开始使用"
2. 导航到: `/app/ippools`
3. **预期**: 
   - 页面上的"创建资源池"按钮应该被高亮
   - 显示遮罩层，只有按钮区域是亮的
   - 按钮旁边有Tips气泡

### 第9步：验证节点添加高亮

1. 创建一个IP资源池（或跳过）
2. 导航到: `/app/nodes`
3. **预期**:
   - "创建节点"按钮应该被高亮
   - 显示Tips气泡引导添加设备

---

## 🐛 故障排查

### 问题1: 控制台没有看到"开发者工具已加载"

**可能原因**:
- App.vue未正确保存
- import语句有错误

**解决**:
```javascript
// 检查import是否存在错误
// 查看控制台是否有报错
```

### 问题2: 欢迎弹窗不显示

**调试命令**:
```javascript
// 查看当前状态
$tips.status()

// 如果completed为true，重置
$tips.reset()

// 手动开始引导
import { useOnboardingStore } from '@/stores/onboarding'
const store = useOnboardingStore()
store.start()
```

### 问题3: 高亮引导不显示

**检查项**:
```javascript
// 1. 检查目标元素是否存在
document.querySelector('[data-tip-target="create-ippool-btn"]')
// 应该返回按钮元素

// 2. 检查当前路由
console.log(window.location.pathname)
// 应该匹配 /app/ippools

// 3. 手动完成前置阶段
$tips.completeStage(0) // 完成欢迎阶段
```

### 问题4: TypeScript报错

**常见错误**:
```
Cannot find module '@/components/tips/TipsContainer.vue'
```

**解决**: 确认文件已创建且路径正确

```
Property 'OnboardingStage' does not exist
```

**解决**: 确认types/tips.ts已创建

### 问题5: 组件渲染错误

**检查**:
```javascript
// 查看Vue DevTools
// 检查TipsContainer组件是否挂载
```

---

## ✅ 验收标准

完成以下所有检查项：

- [ ] 开发服务器正常启动
- [ ] 浏览器控制台无报错
- [ ] `$tips.status()` 可以正常执行
- [ ] `$tips.reset()` 可以重置引导
- [ ] 首次登录/重置后显示欢迎弹窗
- [ ] 欢迎弹窗可以正常关闭
- [ ] 导航到IP资源池页面能看到高亮引导
- [ ] 高亮遮罩正确显示
- [ ] Tips气泡定位准确
- [ ] 刷新页面后状态保持

---

## 📝 下一步

验证通过后：

1. **添加更多目标标记**
   - 连接管理标签
   - 好友列表
   - 其他关键操作按钮

2. **集成事件处理**
   - IP资源池创建成功回调
   - 节点添加成功回调
   - 连接建立回调

3. **完整流程测试**
   - 走通路径A（设备优先）
   - 走通路径B（好友优先）
   - 测试边界情况

4. **优化和调整**
   - 文案优化
   - 动画效果
   - 响应式适配

---

**创建时间**: 2026-01-06  
**验证人**: 开发团队  
**预计完成**: 2026-01-07
