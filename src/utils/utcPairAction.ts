import type { LocalUtcPairView, LocalUtcStatus } from '../types/local'
import { findApprovedPair } from './utcFormat'

/**
 * 本地发起 → 云端授权 → 投影生效的编排。
 *
 * 抽成纯函数是为了可单测：顺序（先本地意图、再云端、最后重写 utcd.conf）、
 * 失败时保留本地 pending 不建链、以及“断开时先找到 approved pair 再 revoke”。
 */
export interface PairActionDeps {
  putLocalIntent: (
    peerId: number,
    intent: 'on' | 'off'
  ) => Promise<{ status: LocalUtcStatus; pairs: LocalUtcPairView[] }>
  getClientConfig: () => Promise<{
    transport_id: string
    edge_candidates: string[]
    peers: Array<{ name: string; transport_id: number }>
  }>
  createPairApproval: (transportA: string, transportB: string, reason: string) => Promise<unknown>
  setAcceleration: (transportId: string, enabled: boolean) => Promise<unknown>
  listPairApprovals: () => Promise<{
    items: Array<{ pair_id: number; transport_id: string; state: string; revision: number }>
  }>
  revokePairApproval: (pairId: number, revision: number, reason: string) => Promise<unknown>
  syncUtcConfig: (payload: {
    edge_candidates?: string[]
    peers: Array<{ name: string; transport_id: number }>
  }) => Promise<LocalUtcStatus>
  /** 当断开最后一个配对、云端剩余 peers 为空时，关闭本机 utcd 避免空转重试已撤销对端。 */
  disableLocalUtc?: () => Promise<LocalUtcStatus>
  /** 把云端结果写回本地 last_result（pending/rejected），失败不阻断主流程。 */
  recordResult: (peerId: number, result: 'pending' | 'rejected', reason: string) => Promise<unknown>
}

export interface PairActionResult {
  localStatus: LocalUtcStatus
  localPairs: LocalUtcPairView[]
  message: string
  /** utcd.conf 是否已按最新 client-config 重写（失败不阻断配对结果）。 */
  peersSynced: boolean
}

const REASON_ON = 'GUI 建立 TCP 连接'
const REASON_OFF = 'GUI 断开 TCP 连接'

export async function applyPairIntent(
  peerId: number,
  intent: 'on' | 'off',
  deps: PairActionDeps
): Promise<PairActionResult> {
  // 1) 本地意愿先落盘：离线/云端失败也不丢，执行仍以投影为准。
  const local = await deps.putLocalIntent(peerId, intent)
  const result: PairActionResult = {
    localStatus: local.status,
    localPairs: local.pairs || [],
    message: '',
    peersSynced: false
  }

  const record = async (next: 'pending' | 'rejected', why: string) => {
    try {
      await deps.recordResult(peerId, next, why)
    } catch {
      /* 本地结果回写失败不阻断云端流程 */
    }
  }

  try {
    // 2) 云端写回：先确认本机 transport 已登记。
    const remote = await deps.getClientConfig()
    const localTransport = String(remote.transport_id || '').trim()
    if (!localTransport) {
      throw new Error('云端未登记本机 transport，无法写回配对')
    }

    if (intent === 'on') {
      // 已存在时后端幂等返回同一 pair；撤销终态才会 409。
      await deps.createPairApproval(localTransport, String(peerId), REASON_ON)
      await deps.setAcceleration(localTransport, true)
      result.message = '已提交云端配对；Core 拉取投影后自动切到 TCP'
      await record('pending', 'waiting_projection')
    } else {
      const approvals = await deps.listPairApprovals()
      const found = findApprovedPair(approvals.items || [], localTransport, String(peerId))
      if (found) {
        await deps.revokePairApproval(found.id, found.revision, REASON_OFF)
      }
      result.message = '已撤销云端配对；撤下投影后自动回落原生 UDP'
    }

    // 3) 配对集变化后重写 utcd.conf 的 peer 列表；若已断开最后一个配对且云端无剩余 peer，
    // 则关闭本机 utcd 避免残留旧 peer 持续拨号重试（失败不阻断配对结果）。
    try {
      const after = await deps.getClientConfig()
      if (after.peers && after.peers.length > 0) {
        result.localStatus = await deps.syncUtcConfig({
          edge_candidates: after.edge_candidates,
          peers: after.peers.map((p) => ({ name: p.name, transport_id: p.transport_id }))
        })
        result.peersSynced = true
      } else if (intent === 'off' && deps.disableLocalUtc) {
        result.localStatus = await deps.disableLocalUtc()
        result.peersSynced = true
      }
    } catch {
      /* 留待下一轮刷新/手动同步 */
    }

    return result
  } catch (error) {
    if (intent === 'on') {
      const status = (error as { response?: { status?: number } })?.response?.status
      const rejected = status === 400 || status === 403 || status === 409 || status === 422
      await record(rejected ? 'rejected' : 'pending', errorText(error))
    }
    throw error
  }
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
