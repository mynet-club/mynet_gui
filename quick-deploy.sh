#!/bin/bash

# 快速部署脚本 - Quick Deploy
# 用于快速更新部署，跳过环境检查等步骤

set -e

# 配置 - 部署目标与 deployment.sh/rollback.sh/pre-deploy-check.sh 同源
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-target.sh"
BUILD_DIR="dist/spa"

# 颜色
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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

# 从环境配置文件读取API URL
if [ -f ".env.prod" ]; then
    API_URL=$(grep "VITE_API_BASE_URL" .env.prod | cut -d'=' -f2)
    print_info "从 .env.prod 读取 API_URL: $API_URL"
else
    # 默认值作为后备
    API_URL="https://my.mynet.club"
    print_warning "未找到 .env.prod，使用默认 API_URL: $API_URL"
fi

echo "🚀 MyNet Frontend - 快速部署"
echo "================================"
echo "目标服务器: ${REMOTE_USER}@${REMOTE_HOST}"
echo "部署路径: ${REMOTE_PATH}"
echo "API地址: ${API_URL}"
echo "================================"

# 构建项目（确保生产环境变量优先）
if [ -f ".env.prod" ]; then
    # quasar.config.ts 读取 process.env，需要先把 .env.prod 导出到 shell 环境
    # 用逐行 export 而非 source，避免含空格的 value 被当作命令执行
    while IFS= read -r line; do
        [[ "$line" =~ ^(VITE_|NODE_ENV) ]] || continue
        export "$line"
    done < .env.prod
    print_info "已加载 .env.prod (API: $VITE_API_BASE_URL)"
fi
print_info "构建项目..."
npm run build

# 同步文件
print_info "同步文件到服务器..."
rsync -avz --delete "$BUILD_DIR/" ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_PATH}/"

# 重载Nginx
print_info "重载Nginx..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "nginx -t && systemctl reload nginx"

print_success "🎉 快速部署完成!"
echo "访问地址: ${API_URL}"
