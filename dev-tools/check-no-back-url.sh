#!/bin/sh
# 守护：后端 API 地址不得出现在本仓任何文件（含归档）。
#
# 裁定（2026-10-12）：GUI 也不能访问/暴露后端 api 地址 ——
# 前端一律同源相对路径；nginx 上游 Host 用 __BACK_API_HOST__ 占位，部署时在服务器替换。
# 本仓 public，字面量进仓 = 暴露。
set -e

fail=0
hits=$(grep -rnE 'api\.mynet\.club|api-mynet\.(mynet\.club|dsplat\.com)|18\.138\.109\.228' \
	--exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.quasar \
	. 2>/dev/null \
	| grep -v 'dev-tools/check-no-back-url\.sh:' || true)

if [ -n "$hits" ]; then
	echo "✗ 后端 API 地址泄漏（前端同源 + 上游 __BACK_API_HOST__ 占位，地址只存服务器）:"
	echo "$hits"
	fail=1
fi

# 前端构建产物不得内嵌绝对 API 基址：VITE_API_BASE_URL 必须留空或相对（.env.dev 例外）
envhits=$(grep -rn '^VITE_API_BASE_URL=https\?://' .env.prod .env.embed .env.example 2>/dev/null || true)
if [ -n "$envhits" ]; then
	echo "✗ VITE_API_BASE_URL 内嵌绝对地址（应留空走同源/相对）:"
	echo "$envhits"
	fail=1
fi

if [ "$fail" -eq 0 ]; then
	echo "✓ check-no-back-url：本仓无后端 API 地址，API 基址同源/相对"
fi
exit $fail
