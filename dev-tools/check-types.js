#!/usr/bin/env node

/**
 * 类型检查闸（2026-10-05 裁定「先补类型检查闸」）
 *
 * 为什么这里要自己写判据而不是拿退出码：本仓**自有源码有 211 条存量类型错**
 * （33 个文件，实测口径见 dev-plan F-1 追加批），vue-tsc 的退出码只会说「有错」，
 * 分不清哪条是你刚写的。而把闸门设成「必须 0 错」= 每次 push 都被历史债堵死，
 * 结局一定是 `--no-verify` 绕过 —— 闸门误报多了就会被绕过，等于没有闸门。
 *
 * 所以是**棘轮（只许降不许升）**：逐文件记存量到 `dev-tools/typecheck-baseline.json`，
 * 某文件条数变多、或冒出一个基线里没有的文件 ⇒ 红。基线里的文件变干净了会**提示**你下调，
 * 但不拦（拦了等于惩罚修 bug 的人）。
 *
 * 上调基线必须是**显式动作**：`node dev-tools/check-types.js --update` 重写基线，
 * 连同 diff 一起进 commit —— 想放宽就得留下署名的决定，不能顺手。
 *
 * ⚠️ 三处防假绿（这个闸自己的失效模式）：
 *   1. vue-tsc 没跑起来（缺依赖 / tsconfig 坏了 / 超时）⇒ 红，不当通过；
 *   2. 跑起来了但一行 `error TS` 都没解析到、退出码又非 0 ⇒ 红（输出形状变了不能当「0 错」）；
 *   3. 基线为空对象 ⇒ 红（第一次落地就该用 --update 生成，空基线是「没东西可查」型门禁）。
 */

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '..')
const BASELINE_FILE = path.join(HERE, 'typecheck-baseline.json')
// 与 IDE / quasar 用的是同一份配置：根 tsconfig.json 只做 `extends: ./.quasar/tsconfig.json`
const TSCONFIG = 'tsconfig.json'

const UPDATE = process.argv.includes('--update')

/** 只认这个形状：`src/foo/Bar.vue(12,7): error TS2339: Property 'x' ...` */
const ERROR_LINE = /^([^(]+)\((\d+),(\d+)\): (error TS\d+): (.*)$/

function runVueTsc () {
  const started = Date.now()
  const result = spawnSync('npx', ['vue-tsc', '-p', TSCONFIG, '--noEmit'], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    shell: process.platform === 'win32'
  })

  if (result.error) {
    fail(`vue-tsc 没能启动：${result.error.message}（npm ci 装依赖了吗？）`)
  }
  // 崩溃（OOM / 段错误）时 stdout 往往为空，下面的解析会得出「0 错」——那是假绿
  if (result.signal) {
    fail(`vue-tsc 被信号 ${result.signal} 打断，本次结论不可用`)
  }

  const stdout = result.stdout ?? ''
  const stderr = result.stderr ?? ''
  const lines = stdout.split('\n').filter((l) => ERROR_LINE.test(l))

  if (result.status !== 0 && lines.length === 0 && ! /error TS\d+/.test(stdout + stderr)) {
    const tail = (stdout + stderr).trim().split('\n').slice(-8).join('\n')
    fail(
      `vue-tsc 退出码 ${result.status}，但一行 \`error TS\` 都没解析到 —— ` +
        `不能当成「0 错」放行。最后几行输出：\n${tail}`
    )
  }

  return { parsed: lines.map((l) => l.match(ERROR_LINE)), exitStatus: result.status, ms: Date.now() - started }
}

function fail (message) {
  console.error(`\n❌ 类型检查闸失效：${message}\n`)
  process.exit(1)
}

function toCounts (parsed) {
  const counts = new Map()
  for (const [, file] of parsed) {
    const key = file.replace(/\\/g, '/')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function readBaseline () {
  if (!existsSync(BASELINE_FILE)) {
    fail(`缺基线文件 ${path.relative(ROOT, BASELINE_FILE)} —— 先跑 node dev-tools/check-types.js --update 生成并连同改动一起提交`)
  }
  const json = JSON.parse(readFileSync(BASELINE_FILE, 'utf8'))
  if (!json.files || Object.keys(json.files).length === 0) {
    fail('基线是空的 —— 空基线等于「没东西可查」，本闸不允许这种形状')
  }
  return json
}

const { parsed, exitStatus, ms } = runVueTsc()
const counts = toCounts(parsed)
const total = parsed.length

if (UPDATE) {
  const next = {
    // 存量清单，不是「正确答案」。每降一次都要在 commit message 里说清降了什么。
    _comment: '类型检查棘轮基线：逐文件的 vue-tsc 错误条数。只许降不许升；上调请用 --update 并连同 diff 提交。',
    generatedBy: 'node dev-tools/check-types.js --update',
    tsconfig: TSCONFIG,
    total,
    files: Object.fromEntries([...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])))
  }
  writeFileSync(BASELINE_FILE, JSON.stringify(next, null, 2) + '\n', 'utf8')
  console.log(`✅ 已写入基线：${total} 条 / ${counts.size} 个文件（${(ms / 1000).toFixed(1)}s）`)
  process.exit(0)
}

const baseline = readBaseline()
const baselineFiles = baseline.files ?? {}

const regressions = []
const improvements = []
const gone = []

for (const [file, n] of counts) {
  const allowed = baselineFiles[file]
  if (allowed === undefined) regressions.push({ file, n, allowed: 0, isNew: true })
  else if (n > allowed) regressions.push({ file, n, allowed, isNew: false })
  else if (n < allowed) improvements.push({ file, n, was: allowed })
}
for (const file of Object.keys(baselineFiles)) {
  if (!counts.has(file)) gone.push(file)
}

console.log(`· vue-tsc（-p ${TSCONFIG}）：${total} 条 / ${counts.size} 个文件，${(ms / 1000).toFixed(1)}s；基线 ${baseline.total} 条`)

if (improvements.length > 0) {
  console.log('  ⚠ 以下文件已变干净，下调基线以免把余量当成可挥霍的空间：')
  improvements.forEach(({ file, n, was }) => console.log(`      ${file}: ${was} → ${n}`))
}
if (gone.length > 0) {
  console.log('  ⚠ 基线里这些文件已不在错误清单中（文件删了或全修完）：')
  gone.forEach((f) => console.log(`      ${f}`))
}

if (regressions.length > 0) {
  const added = regressions.reduce((acc, r) => acc + r.n - r.allowed, 0)
  console.error(`\n❌ 类型检查棘轮涨了 ${added} 条（拦 ${regressions.length} 个文件）：`)
  regressions
    .sort((a, b) => b.n - b.allowed - (a.n - a.allowed))
    .forEach(({ file, n, allowed, isNew }) => {
      console.error(`  ${file}: 基线 ${allowed} 条 → 现在 ${n} 条${isNew ? '（新沾上的文件）' : ''}`)
    })
  console.error('\n  逐条明细（前 40 条）：')
  const regressedFiles = new Set(regressions.map((r) => r.file))
  parsed
    .filter(([, file]) => regressedFiles.has(file.replace(/\\/g, '/')))
    .slice(0, 40)
    .forEach(([, file, line, col, code, message]) => console.error(`    ${file}(${line},${col}): ${code}: ${message}`))
  console.error('\n  修它。确实要放宽：node dev-tools/check-types.js --update（改动会进 diff，看得见）\n')
  process.exit(1)
}

console.log(`✅ 类型检查棘轮未升（退出码 ${exitStatus} 只反映存量债务，判据是逐文件条数）`)
