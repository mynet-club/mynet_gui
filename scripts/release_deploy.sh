#!/bin/sh
# release_deploy.sh — 非交互部署已打包的 mynet_gui web 产物
#
#   sh scripts/release_deploy.sh <artifact-dir> <version>
#   sh scripts/release_deploy.sh --rollback <version>
#
# 目标取自 deploy-target.sh；DEPLOY_USER/DEPLOY_HOST/DEPLOY_PATH 可覆盖。
# 本地演练：DEPLOY_MODE=local DEPLOY_PATH=/tmp/site sh scripts/release_deploy.sh ...
#
# 目录约定：
#   <deploy-base>/releases/<version>/    每个版本一份
#   <deploy-base>/releases/current      当前版本号
#   <deploy-base>/releases/predeploy-*  切换前快照
#   $REMOTE_PATH                        线上目录（保持现有 nginx root 不变）
set -eu

ROOT=$(cd "$(dirname "$0")/.." && pwd)
. "$ROOT/deploy-target.sh"

REMOTE_USER=${DEPLOY_USER:-$REMOTE_USER}
REMOTE_HOST=${DEPLOY_HOST:-$REMOTE_HOST}
REMOTE_PATH=${DEPLOY_PATH:-$REMOTE_PATH}
SITE_URL=${DEPLOY_SITE_URL:-https://my.mynet.club}
MODE=${DEPLOY_MODE:-remote}
RELEASES=${DEPLOY_RELEASES:-$(dirname "$REMOTE_PATH")/releases}

die() { echo "错误: $*" >&2; exit 1; }
info() { echo "▸ $*"; }

if [ "$MODE" = local ]; then
  [ -n "${DEPLOY_PATH:-}" ] || die "DEPLOY_MODE=local 需要 DEPLOY_PATH"
  REMOTE_HOST=
fi

if [ -n "$REMOTE_HOST" ]; then
  REMOTE="${REMOTE_USER}@${REMOTE_HOST}"
  r_run() { ssh -o BatchMode=yes -o ConnectTimeout=10 "$REMOTE" "$*"; }
  r_sync_to() { rsync -az --delete "$1/" "$REMOTE:$2/"; }
else
  r_run() { sh -c "$*"; }
  r_sync_to() { mkdir -p "$2"; rsync -a --delete "$1/" "$2/"; }
fi

r_sync_between() {
  if [ -n "$REMOTE_HOST" ]; then
    r_run "rsync -a --delete '$1/' '$2/'"
  else
    rsync -a --delete "$1/" "$2/"
  fi
}

reload_nginx() {
  [ -n "$REMOTE_HOST" ] || return 0
  r_run "nginx -t >/dev/null 2>&1 && (systemctl reload nginx || nginx -s reload)"
}

fetch_url() {
  if command -v curl >/dev/null 2>&1; then
    curl -fsS --max-time 10 "$1"
  elif command -v wget >/dev/null 2>&1; then
    wget -qO- --timeout=10 "$1"
  else
    return 1
  fi
}

healthcheck() {
  _version=$1
  if [ -n "$REMOTE_HOST" ]; then
    _body=$(fetch_url "$SITE_URL/version.json?ts=$(date +%s)") || return 1
    printf '%s' "$_body" | grep -q "\"version\":\"$_version\""
  else
    [ -f "$REMOTE_PATH/version.json" ] || return 1
    grep -q "\"version\":\"$_version\"" "$REMOTE_PATH/version.json"
  fi
}

set_current() {
  r_run "printf '%s\n' '$1' > '$RELEASES/current'"
}

rollback_to() {
  _version=$1
  r_run "test -d '$RELEASES/$_version'" || die "回滚版本不存在：$RELEASES/$_version"
  info "回滚到 $_version"
  r_sync_between "$RELEASES/$_version" "$REMOTE_PATH"
  set_current "$_version"
  reload_nginx
  healthcheck "$_version" || die "回滚后健康检查失败：$_version"
  info "✓ 已回滚到 $_version"
}

if [ "${1:-}" = "--rollback" ]; then
  [ "$#" -eq 2 ] || { echo "用法: $0 --rollback <version>" >&2; exit 2; }
  rollback_to "$2"
  exit 0
fi

[ "$#" -eq 2 ] || { sed -n '2,12p' "$0"; exit 2; }
ARTIFACT_DIR=$1
VERSION=$2
case "$VERSION" in
  ''|*[!A-Za-z0-9._-]*) die "非法版本号：$VERSION" ;;
esac

ARTIFACT="$ARTIFACT_DIR/mynet_gui-$VERSION-web.tar.gz"
[ -f "$ARTIFACT" ] || die "产物不存在：$ARTIFACT"

TMP=$(mktemp -d "${TMPDIR:-/tmp}/mynet-gui-deploy.XXXXXX")
trap 'rm -rf "$TMP"' EXIT INT TERM
tar -xzf "$ARTIFACT" -C "$TMP"
[ -f "$TMP/index.html" ] || die "产物内缺 index.html"
if grep -q '/gui/assets/' "$TMP/index.html"; then
  die "产物是 embed 口径（/gui/assets/），拒绝部署到 web 根路径"
fi

COMMIT=$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo unknown)
printf '{"version":"%s","commit":"%s","deployed_at":"%s"}\n' \
  "$VERSION" "$COMMIT" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$TMP/version.json"

info "部署 $VERSION -> ${REMOTE_HOST:-local}:$REMOTE_PATH"

PREV=$(r_run "cat '$RELEASES/current' 2>/dev/null || true")
PREV=$(printf '%s' "$PREV" | tr -d '\r\n')
BACKUP=
SNAP="$RELEASES/predeploy-$VERSION-$(date -u +%Y%m%dT%H%M%SZ)"
if r_run "test -d '$REMOTE_PATH'"; then
  if r_run "mkdir -p '$SNAP' && cp -a '$REMOTE_PATH/.' '$SNAP/'"; then
    BACKUP=$SNAP
  else
    die "备份当前版本失败，停止部署"
  fi
fi

restore_on_failure() {
  if [ -n "$BACKUP" ]; then
    echo "  ↺ 恢复切换前快照：$BACKUP" >&2
    r_sync_between "$BACKUP" "$REMOTE_PATH" || true
  else
    r_run "rm -rf '$REMOTE_PATH'" || true
  fi
  if [ -n "$PREV" ]; then
    set_current "$PREV" || true
  fi
  reload_nginx || true
}
trap 'restore_on_failure; rm -rf "$TMP"' EXIT INT TERM

r_run "mkdir -p '$RELEASES/$VERSION'"
r_sync_to "$TMP" "$RELEASES/$VERSION"
r_sync_between "$RELEASES/$VERSION" "$REMOTE_PATH"
set_current "$VERSION"
reload_nginx
if ! healthcheck "$VERSION"; then
  echo "✗ 健康检查失败：$SITE_URL/version.json" >&2
  restore_on_failure
  trap 'rm -rf "$TMP"' EXIT INT TERM
  exit 1
fi

if [ -n "$REMOTE_HOST" ]; then
  r_run "cd '$RELEASES' && ls -1dt */ 2>/dev/null | tail -n +6 | xargs -r rm -rf"
fi

trap 'rm -rf "$TMP"' EXIT INT TERM
info "✓ 已部署 $VERSION（上一版本：${PREV:-none}）"
