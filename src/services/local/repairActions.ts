/**
 * 本机「修复动作」目录（Phase 5b）。
 *
 * ## 为什么是目录，而不是让 AI 直接给命令
 *
 * playbook §4.6 的边界：**任何修改本机网络/隧道/开关的操作必须经用户点击确认后
 * 调用 localapi 执行**。如果把 AI 生成的 argv 直接转发给 `/api/v1/command`，
 * 就等于把「写」能力交给了模型 —— 提示注入、幻觉参数、越权子命令都无法兜底。
 *
 * 所以写路径是**前端固定的动作目录**：每个动作的 argv 是常量、有影响说明、
 * 必须经过确认闸；AI 只负责给出「建议做哪一类动作」，不参与构造命令。
 *
 * ## 三道闸（从外到内）
 *
 * 1. 目录闸：只有 `REPAIR_ACTIONS` 里的 id 能执行，未知 id 直接抛错；
 * 2. 确认闸：`mutating` 动作必须 `confirmed === true` 才发请求（服务层再判一次，
 *    不依赖 UI 是否记得禁用按钮）；
 * 3. agent 白名单：`argv[0]` 必须在 mynetd `allowedSubcommand()` 内（本文件镜像一份，
 *    测试断言两边不漂移）；秘密类 argv（`--private`/`--password`/`--token`/`--secret`）
 *    一律拒绝——与 agent 侧同一条红线（秘密会进 `ps`）。
 */
import { localGatewayApi } from './localApi'

/** 与 `mynetd/localapi/handlers.go::allowedSubcommand` 镜像；测试守住不漂移。 */
export const AGENT_ALLOWED_SUBCOMMANDS: readonly string[] = [
  'detector', 'metrics', 'apply', 'service', 'driver',
  'setup', 'install', 'uninstall', 'update', 'config',
  'refresh-config', 'refresh-routes', 'refresh-address',
  'status', 'node-status', 'route', 'monitor', 'check', 'nodes', 'platform', 'plugin',
  'proxy', 'auth', 'tenants', 'node',
]

/** 秘密参数走 argv 会进 `ps`；前端在发出前就拦，不指望 agent 兜底。 */
const SECRET_FLAGS = ['--private', '--password', '--token', '--secret']

export interface RepairAction {
  id: string
  title: string
  description: string
  /** 影响范围：确认卡片上必须展示，用户据此决定是否执行 */
  impact: string
  argv: readonly string[]
  /** 是否会改变本机状态（false = 纯检查，可不弹确认） */
  mutating: boolean
}

export const REPAIR_ACTIONS: readonly RepairAction[] = [
  {
    id: 'check',
    title: '运行健康检查',
    description: '检查配置、驱动与系统路由是否一致（mynet check）',
    impact: '只读，不修改任何配置',
    argv: ['check'],
    mutating: false,
  },
  {
    id: 'parity',
    title: '检查对端一致性',
    description: '对比 node.conf 与对端约定（zip / crypto / passcode）',
    impact: '只读，不修改任何配置',
    argv: ['config', 'parity', '--json'],
    mutating: false,
  },
  {
    id: 'status',
    title: '刷新节点状态',
    description: '重新读取本机节点运行态（mynet status --json）',
    impact: '只读，不修改任何配置',
    argv: ['status', '--json'],
    mutating: false,
  },
  {
    id: 'apply-config',
    title: '应用当前配置',
    description: '把当前节点配置渲染为驱动原生配置（mynet apply）',
    impact: '会重写驱动原生配置；隧道可能需要重启后生效',
    argv: ['apply'],
    mutating: true,
  },
  {
    id: 'refresh-routes',
    title: '刷新路由',
    description: '重新下发路由（mynet refresh-routes）',
    impact: '会改动系统路由表；已建立连接的会话可能短暂中断',
    argv: ['refresh-routes'],
    mutating: true,
  },
  {
    id: 'restart-gnb',
    title: '重启 gnb 隧道',
    description: '重启 gnb 驱动进程（mynet service restart gnb）',
    impact: '隧道会短暂中断；正在传输的会话（SSH/HTTP）会断开重连',
    argv: ['service', 'restart', 'gnb'],
    mutating: true,
  },
  {
    id: 'restart-wireguard',
    title: '重启 wireguard 隧道',
    description: '重启 wireguard 驱动（mynet service restart wireguard）',
    impact: '隧道会短暂中断；正在传输的会话会断开重连',
    argv: ['service', 'restart', 'wireguard'],
    mutating: true,
  },
]

export class RepairActionError extends Error {
  readonly reason: 'unknown_action' | 'confirmation_required' | 'forbidden_argv'
  readonly reasonCode: string

  constructor(message: string, reason: 'unknown_action' | 'confirmation_required' | 'forbidden_argv') {
    super(message)
    this.name = 'RepairActionError'
    this.reason = reason
    this.reasonCode = reason
  }
}

export function getRepairAction(id: string): RepairAction | null {
  return REPAIR_ACTIONS.find((action) => action.id === id) ?? null
}

/** 只做静态校验，不发请求；供 UI 预检与测试复用。 */
export function assertActionAllowed(action: RepairAction): void {
  const [subcommand] = action.argv

  if (!subcommand || !AGENT_ALLOWED_SUBCOMMANDS.includes(subcommand)) {
    throw new RepairActionError(
      `动作 ${action.id} 的子命令不在本机 API 白名单内：${subcommand ?? '(empty)'}`,
      'forbidden_argv',
    )
  }

  for (const arg of action.argv) {
    if (SECRET_FLAGS.some((flag) => arg === flag || arg.startsWith(`${flag}=`))) {
      throw new RepairActionError(`动作 ${action.id} 不允许携带秘密参数（会进 ps）：${arg}`, 'forbidden_argv')
    }
  }
}

/**
 * 执行目录内的一个动作。
 *
 * `mutating` 动作必须显式 `confirmed: true` —— 这是**服务层**的确认闸，
 * 不依赖 UI 是否禁用了按钮。
 */
export async function runRepairAction(
  id: string,
  options: { confirmed?: boolean; timeoutMs?: number } = {},
): Promise<{ stdout: string; stderr: string }> {
  const action = getRepairAction(id)
  if (!action) {
    throw new RepairActionError(`未知的修复动作：${id}`, 'unknown_action')
  }

  assertActionAllowed(action)

  if (action.mutating && options.confirmed !== true) {
    throw new RepairActionError(`动作「${action.title}」需要用户确认后才能执行`, 'confirmation_required')
  }

  const result = await localGatewayApi.runCommand([...action.argv], options.timeoutMs ?? 30000)

  return {
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}
