#!/bin/sh
# Release build: install locked dependencies, then produce a web-mode dist/spa.
set -eu

npm ci
npm run build

[ -f dist/spa/index.html ] || {
  echo "✗ dist/spa/index.html 缺失（quasar build 未产出 SPA）" >&2
  exit 1
}

# web 口径必须是根路径资源；/gui/ 是 embed 口径，混用会让 my.mynet.club 路由全坏
if grep -q '/gui/assets/' dist/spa/index.html; then
  echo "✗ 构建产物是 embed 口径（/gui/assets/），web 发布必须是 /assets/" >&2
  exit 1
fi

asset=$(sed -n 's/.*src="\(\/assets\/[^"]*\.js\)".*/\1/p' dist/spa/index.html | head -1)
[ -n "$asset" ] || {
  echo "✗ dist/spa/index.html 未引用 /assets/*.js（web 包不完整）" >&2
  exit 1
}
[ -f "dist/spa$asset" ] || {
  echo "✗ index.html 引用的资源不存在：dist/spa$asset" >&2
  exit 1
}
