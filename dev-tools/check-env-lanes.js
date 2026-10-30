#!/usr/bin/env node
/**
 * 构建口径车道护栏（make lint 会跑）。
 *
 * 背景（2026-10-30 拆开）：.env.prod 与 .env.embed 曾被合并成一份 embed 口径，
 * `deployment.sh` 直跑就打出 /gui/ 基路径包 —— my.mynet.club 路由全坏、线上登录
 * 只能靠构建期换文件救。这里把车道钉死：
 *   .env.prod  = web（my.mynet.club 根路径 + /api/ 同源）—— 不许带 /gui 基路径
 *   .env.embed = embed（发行包内嵌 WebUI）—— 必须带 /gui 基路径
 */
import { readFileSync } from 'node:fs';

function parse(file) {
  const out = {};
  for (const line of readFileSync(file, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq > 0) out[t.slice(0, eq).trim()] = t.slice(eq + 1).trim();
  }
  return out;
}

const errors = [];
const web = parse('.env.prod');
const embed = parse('.env.embed');

// web 车道：出现 /gui 基路径即为 embed 口径混入
if ((web.VITE_API_BASE_URL || '').includes('/gui')) {
  errors.push('.env.prod 是 web 口径：VITE_API_BASE_URL 不得含 /gui（embed 归 .env.embed）');
}
if ((web.VITE_ROUTER_BASE || '').includes('/gui')) {
  errors.push('.env.prod 是 web 口径：VITE_ROUTER_BASE 不得含 /gui（embed 归 .env.embed）');
}

// embed 车道：缺 /gui 基路径即为 web 口径混入
if ((embed.VITE_ROUTER_BASE || '') !== '/gui/') {
  errors.push(".env.embed 是 embed 口径：VITE_ROUTER_BASE 必须 = /gui/");
}
if ((embed.VITE_API_BASE_URL || '') !== '/gui') {
  errors.push(".env.embed 是 embed 口径：VITE_API_BASE_URL 必须 = /gui");
}

if (errors.length > 0) {
  for (const e of errors) console.error('✗ ' + e);
  console.error('  口径分工见 .env.prod / .env.embed 头注释：web=.env.prod，embed=.env.embed，禁止合并。');
  process.exit(1);
}
console.log('✓ env 口径车道（web=.env.prod / embed=.env.embed）');
