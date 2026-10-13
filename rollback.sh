#!/bin/bash

# 回滚脚本 - Rollback Script
# 用于快速回滚到之前的版本

set -e

# 配置 - 部署目标与 deployment.sh/quick-deploy.sh/pre-deploy-check.sh 同源
# （此前指向旧 dsplat 主机/目录，真回滚会 rm -rf 旧目录、救不了现行站点）
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-target.sh"

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔄 MyNet Frontend - 版本回滚"
echo "============================="

# 列出可用的备份
print_info "查找可用的备份版本..."
BACKUPS=$(ssh ${REMOTE_USER}@${REMOTE_HOST} "ls -1t /tmp/mynet-frontend-backup-* 2>/dev/null" || echo "")

if [ -z "$BACKUPS" ]; then
    print_error "未找到任何备份版本"
    exit 1
fi

echo "可用的备份版本:"
echo "$BACKUPS" | nl -v0

# 选择备份版本
echo ""
read -p "请选择要回滚的备份版本 (输入序号): " CHOICE

if ! [[ "$CHOICE" =~ ^[0-9]+$ ]]; then
    print_error "无效的选择"
    exit 1
fi

SELECTED_BACKUP=$(echo "$BACKUPS" | sed -n "$((CHOICE + 1))p")

if [ -z "$SELECTED_BACKUP" ]; then
    print_error "无效的备份版本"
    exit 1
fi

print_info "选择的备份版本: $SELECTED_BACKUP"

# 确认回滚
echo ""
print_warning "此操作将回滚当前版本到: $SELECTED_BACKUP"
read -p "确认继续? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "回滚操作已取消"
    exit 0
fi

# 执行回滚
print_info "开始回滚..."

# 备份当前版本
CURRENT_BACKUP="/tmp/mynet-frontend-rollback-backup-$(date +%Y%m%d-%H%M%S)"
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    cp -r '${REMOTE_PATH}' '${CURRENT_BACKUP}'
    echo '当前版本已备份到: ${CURRENT_BACKUP}'
"

# 执行回滚
ssh ${REMOTE_USER}@${REMOTE_HOST} "
    rm -rf '${REMOTE_PATH}'/*
    cp -r '${SELECTED_BACKUP}'/* '${REMOTE_PATH}/'
    
    # 设置权限
    find '${REMOTE_PATH}' -type d -exec chmod 755 {} \;
    find '${REMOTE_PATH}' -type f -exec chmod 644 {} \;
    chown -R www-data:www-data '${REMOTE_PATH}' 2>/dev/null || chown -R nginx:nginx '${REMOTE_PATH}' 2>/dev/null || true
    
    # 重载Nginx
    systemctl reload nginx
"

print_success "🎉 回滚完成!"
print_info "当前版本已备份到: $CURRENT_BACKUP"
echo "访问地址: https://my.mynet.club"
