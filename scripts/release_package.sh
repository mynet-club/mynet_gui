#!/bin/sh
# Package the built Quasar SPA into the release artifact directory.
set -eu

out=${1:?usage: release_package.sh OUT_DIR VERSION}
version=${2:?usage: release_package.sh OUT_DIR VERSION}

mkdir -p "$out"
test -d dist/spa
[ -f dist/spa/index.html ] || {
  echo "✗ dist/spa/index.html 缺失，拒绝打包空 SPA" >&2
  exit 1
}
tar -czf "$out/mynet_gui-$version-web.tar.gz" -C dist/spa .
