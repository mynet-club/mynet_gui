# mynet_gui (Vue3 前端) — v2 升级指南

> 优先级: **P2（第六批升级）** — 仅对接 mynet_back API，不直接使用 CTL
> 关联文档: `mynet_ctl/docs/v2-upgrade-plan.md`（总规划）

---

## 一、当前状态

| 项目 | 值 |
|------|------|
| 框架 | Vue 3 + Quasar Framework + Vite |
| 版本 | 1.0.0 (package.json) |
| 域名 | `my.mynet.club` |
| API | 仅对接 mynet_back |

**当前 URL 配置：**

| 文件 | 当前 URL | 操作 |
|------|----------|------|
| `.env.production` → `VITE_API_BASE_URL` | `https://my.mynet.club` | 改为 `https://api.mynet.club` |
| `.env.production` → `VITE_REVERB_HOST` | `api.mynet.club` | 无需改 |
| `.env` / `.env.development` → `VITE_API_BASE_URL` | `http://localhost:8000` | 改为 `http://api.mynet.local` |
| `src/config/app.ts` | 读 `VITE_API_BASE_URL` | 不改 |
| `src/services/api.ts` | 读 `VITE_API_BASE_URL` | 拼接 `/api/v1` → 改 `/api/v2` |
| `src/components/auth/RegisterForm.vue` | `https://mynet.club/village` | 链接，可选更新 |

---

## 二、升级任务

### 2.1 统一 API 域名

**文件: `.env.production`**

```env
# 旧值:
# VITE_API_BASE_URL=https://my.mynet.club
# 新值:
VITE_API_BASE_URL=https://api.mynet.club
```

### 2.2 开发环境使用 Nginx 代理

**文件: `.env.development`**

```env
# 旧值:
# VITE_API_BASE_URL=http://localhost:8000
# 新值:
VITE_API_BASE_URL=http://api.mynet.local
```

### 2.3 API 路径升级 v1 → v2

搜索所有 `/api/v1` 拼接，改为 `/api/v2`：

**文件: `src/services/api.ts`**（或类似文件）

```typescript
// 旧值:
// const API_PREFIX = '/api/v1';
// 新值:
const API_PREFIX = '/api/v2';
```

---

## 三、需要修改的文件清单

| 文件 | 操作 | 变更 |
|------|------|------|
| `.env.production` | 编辑 | VITE_API_BASE_URL 域名 |
| `.env.development` | 编辑 | 开发环境域名 |
| `src/services/api.ts` | 编辑 | `/api/v1` → `/api/v2` |

---

## 四、验证方法

```bash
# 1. 启动本地开发
cd mynet_gui && npx quasar dev

# 2. 浏览器打开 http://localhost:5173
# 3. 打开 DevTools → Network，确认 API 请求发往 api.mynet.local/api/v2
# 4. 测试登录、Zone 列表、节点列表
```

---

## 五、回滚方案

修改 `.env.production` 和 API 前缀回 v1 即可。

**预计工作量**: 小（1 小时）
