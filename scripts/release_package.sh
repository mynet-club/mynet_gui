#!/bin/sh
# Package the built Quasar SPA into the release artifact directory.
set -eu

out=${1:?usage: release_package.sh OUT_DIR VERSION}
version=${2:?usage: release_package.sh OUT_DIR VERSION}

test -d dist/spa
tar -czf "$out/mynet_gui-$version-web.tar.gz" -C dist/spa .
