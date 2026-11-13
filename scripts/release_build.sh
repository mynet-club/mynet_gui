#!/bin/sh
# Release build: locked deps, web-mode dist/spa, and a version stamp.
set -eu

VERSION=${1:?usage: release_build.sh VERSION}

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

commit=$(git rev-parse --short HEAD 2>/dev/null || echo unknown)
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)
built_at=$(date -u '+%Y-%m-%d %H:%M:%S')
cat > dist/spa/deployment-info.json <<EOF
{
  "project": "MyNet Frontend",
  "version": "$VERSION",
  "buildTime": "$built_at",
  "gitBranch": "$branch",
  "gitCommit": "$commit",
  "apiUrl": "",
  "environment": "production"
}
EOF
grep -q "\"version\": \"$VERSION\"" dist/spa/deployment-info.json || {
  echo "✗ deployment-info.json 版本写入失败" >&2
  exit 1
}
