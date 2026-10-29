import { ref } from 'vue'
import { LocalApiError, localGatewayApi } from '../services/local/localApi'

/** 执行本机 mynet 命令：busy + 成功/失败消息，与旧 HTML doAction 同语义。 */
export function useLocalCommand() {
  const busy = ref(false)
  const message = ref('')
  const ok = ref(false)

  async function run(argv: string[], label: string, timeout = 60000): Promise<boolean> {
    busy.value = true
    message.value = ''
    try {
      const res = await localGatewayApi.runCommand(argv, timeout)
      const out = ((res.stdout || '') + (res.stderr || '')).trim()
      ok.value = true
      message.value = out ? `${label}成功` : `${label}成功`
      return true
    } catch (e) {
      ok.value = false
      message.value = e instanceof LocalApiError ? e.message : String(e)
      return false
    } finally {
      busy.value = false
    }
  }

  return { busy, message, ok, run }
}
