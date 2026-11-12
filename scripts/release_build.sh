#!/bin/sh
# Release build: install locked dependencies, then produce dist/spa.
set -eu

npm ci
npm run build
