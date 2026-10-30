#!/usr/bin/env node
/**
 * embed 构建入口（发行包内嵌 WebUI，/gui/ 基路径）。
 *
 * 口径分工见 .env.embed 头注释：embed 用 .env.embed，web 用 .env.prod，禁止合并。
 * Quasar prod 构建只认 .env.prod / .env.local.prod —— 本脚本把 .env.embed 写进
 * **.env.local.prod**（.gitignore 里，构建后清掉）作覆盖层，全程不碰 .env.prod。
 * 覆盖层语义与 Quasar 查找序一致（.env.local.prod 后于 .env.prod、胜出），
 * quasar.config.ts 的 loadEnvFiles() 读同一组文件喂 build.env。
 *
 * 产物判据：dist/spa/index.html 必须引 /gui/assets/（mynet_desktop release.yml 查同一条）。
 */
import { copyFileSync, existsSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const OVERRIDE = '.env.local.prod';

if (existsSync(OVERRIDE)) {
  console.error(`✗ 已存在 ${OVERRIDE} —— 可能是上次未清的覆盖层或你自己的本地覆盖。`);
  console.error('  先人工确认它的内容：是 .env.embed 的副本就删掉再跑；是你自己的覆盖就别用 build:embed。');
  process.exit(1);
}

copyFileSync('.env.embed', OVERRIDE);
try {
  const r = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', shell: process.platform === 'win32' });
  process.exitCode = r.status ?? 1;
} finally {
  rmSync(OVERRIDE, { force: true });
}
