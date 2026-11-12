#!/bin/sh
# Release build: install locked dependencies, then produce dist/spa.
set -eu

npm ci
npm run build

[ -f dist/spa/index.html ] || {
  echo "✗ dist/spa/index.html 缺失（quasar build 未产出 SPA）" >&2
  exit 1
}
