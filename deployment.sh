#!/bin/bash

# MyNet Front-End Deployment Script
# 项目部署脚本 - 自动编译并部署到生产环境

set -e  # 遇到错误立即退出

# =============================================================================
# 配置变量
# =============================================================================
PROJECT_NAME="MyNet Frontend"
BUILD_DIR="dist/spa"
REMOTE_USER="root"
REMOTE_HOST="52.77.179.176"
REMOTE_PATH="/data/app/mynet.club/my/public"
NGINX_PATH="/usr/sbin/nginx"
WEB_USER="www"
WS_URL="wss://my.mynet.club/wss"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# =============================================================================
# 辅助函数
# =============================================================================

# 打印带颜色的消息
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

# 从环境配置文件读取API URL
if [ -f ".env.production" ]; then
    API_URL=$(grep "VITE_API_BASE_URL" .env.production | cut -d'=' -f2)
    print_info "从 .env.production 读取 API_URL: $API_URL"
else
    # 默认值作为后备
    API_URL="https://my.mynet.club"
    print_warning "未找到 .env.production，使用默认 API_URL: $API_URL"
fi

# 打印分隔线
print_separator() {
    echo "============================================================================="
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装或不在PATH中"
        exit 1
    fi
}

# 确认操作
confirm_action() {
    echo -e "${YELLOW}[CONFIRM]${NC} $1"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "操作已取消"
        exit 0
    fi
}

# =============================================================================
# 主要功能函数
# =============================================================================

# 显示脚本信息
show_info() {
    print_separator
    echo -e "${BLUE}${PROJECT_NAME} 部署脚本${NC}"
    echo "版本: 1.0.0"
    echo "目标服务器: ${REMOTE_USER}@${REMOTE_HOST}"
    echo "部署路径: ${REMOTE_PATH}"
    echo "API地址: ${API_URL}"
    print_separator
}

# 检查环境依赖
check_dependencies() {
    print_info "检查环境依赖..."
    
    # 检查必要的命令
    check_command "node"
    check_command "npm"
    check_command "rsync"
    check_command "ssh"
    
    # 检查Node.js版本
    NODE_VERSION=$(node --version)
    print_info "Node.js版本: $NODE_VERSION"
    
    # 检查是否是Git仓库
    if [ ! -d ".git" ]; then
        print_warning "当前目录不是Git仓库"
    else
        GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
        GIT_COMMIT=$(git rev-parse --short HEAD)
        print_info "Git分支: $GIT_BRANCH"
        print_info "Git提交: $GIT_COMMIT"
    fi
    
    print_success "环境检查完成"
}

# 检查SSH连接
check_ssh_connection() {
    print_info "检查SSH连接..."
    
    if ssh -o ConnectTimeout=10 -o BatchMode=yes ${REMOTE_USER}@${REMOTE_HOST} exit 2>/dev/null; then
        print_success "SSH连接正常"
    else
        print_error "SSH连接失败，请检查:"
        echo "  1. 服务器地址是否正确: ${REMOTE_HOST}"
        echo "  2. SSH密钥是否已配置"
        echo "  3. 网络连接是否正常"
        exit 1
    fi
}

# 安装依赖
install_dependencies() {
    print_info "安装项目依赖..."
    
    if [ -f "package-lock.json" ]; then
        npm ci
    else
        npm install
    fi
    
    print_success "依赖安装完成"
}

# 更新配置文件
# 更新配置文件
update_config() {
    print_info "准备生产环境配置..."
    
    # 确保 .env.production 文件存在并且是最新的
    if [ -f ".env.production" ]; then
        print_info "发现 .env.production 配置文件"
        # 验证生产环境配置是否包含必要的变量
        if ! grep -q "VITE_API_BASE_URL" .env.production; then
            print_warning "更新 .env.production 中的 API_URL"
            echo "VITE_API_BASE_URL=${API_URL}" >> .env.production
        fi
        if ! grep -q "VITE_WS_URL" .env.production; then
            print_warning "更新 .env.production 中的 WS_URL"
            echo "VITE_WS_URL=${WS_URL}" >> .env.production
        fi
        print_success "生产环境配置已验证"
    else
        print_warning "创建 .env.production 配置文件..."
        cat > .env.production << EOF
# MyNet Frontend Environment Configuration
# 生产环境配置文件

# 应用环境
NODE_ENV=production

# API配置
VITE_API_BASE_URL=${API_URL}
VITE_WS_URL=${WS_URL}

# 应用配置
VITE_APP_TITLE=MyNet
VITE_APP_DESCRIPTION=MyNet Network Management System
VITE_APP_VERSION=1.0.0

# 功能开关
VITE_ENABLE_PWA=false
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=false

# 安全配置
VITE_ENABLE_HTTPS=true
VITE_ENABLE_CSRF=true

# 缓存配置
VITE_CACHE_TIMEOUT=300000
VITE_ENABLE_CACHE=true

# 日志配置
VITE_LOG_LEVEL=error
VITE_ENABLE_CONSOLE_LOG=false
EOF
        print_success "已创建生产环境配置"
    fi
}

# 构建项目
build_project() {
    print_info "开始构建项目..."
    
    # 清理之前的构建
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_info "已清理旧的构建文件"
    fi
    
    # 临时备份可能影响环境变量的文件
    if [ -f ".env.local" ]; then
        mv .env.local .env.local.backup.deploy
        print_info "已临时备份 .env.local 文件"
    fi
    
    # 确保 .env.production 文件存在并检查配置
    if [ ! -f ".env.production" ]; then
        print_error "未找到 .env.production 文件"
        exit 1
    fi
    
    # 显示将要使用的环境变量
    print_info "检查生产环境配置:"
    grep "VITE_API_BASE_URL" .env.production || print_warning "未找到 VITE_API_BASE_URL 配置"
    grep "VITE_WS_URL" .env.production || print_warning "未找到 VITE_WS_URL 配置"
    
    # 显式加载生产环境变量
    export $(grep -v '^#' .env.production | xargs)
    print_info "已显式加载 .env.production 环境变量"
    print_info "VITE_API_BASE_URL=$VITE_API_BASE_URL"
    print_info "VITE_WS_URL=$VITE_WS_URL"
    
    # 执行生产环境构建 - Quasar 默认就是生产模式
    print_info "执行 Quasar 构建..."
    print_info "构建命令: NODE_ENV=production npm run build"
    
    # 设置环境变量确保使用生产模式
    export NODE_ENV=production
    
    if ! npm run build; then
        print_error "构建失败"
        # 恢复备份的文件
        if [ -f ".env.local.backup.deploy" ]; then
            mv .env.local.backup.deploy .env.local
            print_info "已恢复 .env.local 文件"
        fi
        exit 1
    fi
    
    # 检查构建结果
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "构建失败，未找到构建目录: $BUILD_DIR"
        # 恢复备份的文件
        if [ -f ".env.local.backup.deploy" ]; then
            mv .env.local.backup.deploy .env.local
            print_info "已恢复 .env.local 文件"
        fi
        exit 1
    fi
    
    # 检查构建的文件是否包含正确的API URL
    print_info "验证构建配置..."
    if find "$BUILD_DIR" -name "*.js" -exec grep -l "localhost:8000" {} \; | head -1 | grep -q .; then
        print_error "构建文件中仍包含开发环境API地址 localhost:8000"
        print_error "这表明环境变量没有正确加载"
        # 恢复备份的文件
        if [ -f ".env.local.backup.deploy" ]; then
            mv .env.local.backup.deploy .env.local
            print_info "已恢复 .env.local 文件"
        fi
        exit 1
    fi
    
    # 恢复备份的文件
    if [ -f ".env.local.backup.deploy" ]; then
        mv .env.local.backup.deploy .env.local
        print_info "已恢复 .env.local 文件"
    fi
    
    # 显示构建文件大小
    BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
    print_success "构建完成，文件大小: $BUILD_SIZE"
}

# 创建部署信息文件
create_deployment_info() {
    print_info "创建部署信息文件..."
    
    DEPLOY_TIME=$(date '+%Y-%m-%d %H:%M:%S')
    DEPLOY_USER=$(whoami)
    DEPLOY_HOST=$(hostname)
    
    cat > "$BUILD_DIR/deployment-info.json" << EOF
{
  "project": "${PROJECT_NAME}",
  "version": "$(cat package.json | grep '"version"' | cut -d'"' -f4)",
  "buildTime": "${DEPLOY_TIME}",
  "deployUser": "${DEPLOY_USER}",
  "deployHost": "${DEPLOY_HOST}",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "gitCommit": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')",
  "apiUrl": "${API_URL}",
  "environment": "production"
}
EOF
    
    print_success "部署信息文件已创建"
}

# 备份远程文件
backup_remote() {
    print_info "备份远程文件..."
    
    BACKUP_DIR="/tmp/mynet-frontend-backup-$(date +%Y%m%d-%H%M%S)"
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        if [ -d '${REMOTE_PATH}' ]; then
            mkdir -p '${BACKUP_DIR}'
            cp -r '${REMOTE_PATH}'/* '${BACKUP_DIR}/' 2>/dev/null || true
            echo '备份已创建: ${BACKUP_DIR}'
            
            # 清理超过7天的备份文件
            find /tmp -name 'mynet-frontend-backup-*' -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true
            echo '已清理超过7天的旧备份文件'
        else
            echo '远程目录不存在，无需备份'
        fi
    "
    
    print_success "远程备份完成"
}

# 部署到服务器
deploy_to_server() {
    print_info "部署文件到服务器..."
    
    # 确保远程目录存在
    ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p '${REMOTE_PATH}'"
    
    # 显示将要同步的文件信息
    print_info "同步文件信息："
    echo "源目录: $BUILD_DIR/"
    echo "目标: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
    echo "使用 rsync --delete 模式，将清理目标目录中的旧文件"
    
    # 使用rsync同步文件（--delete会清理旧的JS/CSS文件，防止积累）
    if rsync -avz --delete \
        --exclude='.git*' \
        --exclude='node_modules' \
        --exclude='*.log' \
        --stats \
        "$BUILD_DIR/" \
        ${REMOTE_USER}@${REMOTE_HOST}:"${REMOTE_PATH}/"; then
        print_success "文件同步完成"
        print_info "rsync --delete 已自动清理旧的构建文件"
    else
        print_error "文件同步失败"
        exit 1
    fi
}

# 设置远程权限
set_remote_permissions() {
    print_info "设置远程文件权限..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        # 设置目录权限
        find '${REMOTE_PATH}' -type d -exec chmod 755 {} \;
        
        # 设置文件权限
        find '${REMOTE_PATH}' -type f -exec chmod 644 {} \;
        
        # 确保nginx用户可以访问
        chown -R ${WEB_USER}:${WEB_USER} '${REMOTE_PATH}' 2>/dev/null || true
        
        echo '权限设置完成'
    "
    
    print_success "远程权限设置完成"
}

# 重启Nginx服务
restart_nginx() {
    print_info "重启Nginx服务..."
    
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        # 测试Nginx配置
        ${NGINX_PATH} -t && {
            # 重载Nginx配置
            ${NGINX_PATH} -s reload || systemctl reload nginx || service nginx reload
            echo 'Nginx已重载'
        } || {
            echo 'Nginx配置测试失败'
            exit 1
        }
    "
    
    print_success "Nginx服务已重启"
}

# 验证部署
verify_deployment() {
    print_info "验证部署结果..."
    
    # 检查远程文件
    ssh ${REMOTE_USER}@${REMOTE_HOST} "
        if [ -f '${REMOTE_PATH}/index.html' ]; then
            echo '✓ index.html 存在'
        else
            echo '✗ index.html 不存在'
            exit 1
        fi
        
        if [ -f '${REMOTE_PATH}/deployment-info.json' ]; then
            echo '✓ deployment-info.json 存在'
            cat '${REMOTE_PATH}/deployment-info.json'
        else
            echo '✗ deployment-info.json 不存在'
        fi
        
        # 显示目录大小
        echo \"部署目录大小: \$(du -sh '${REMOTE_PATH}' | cut -f1)\"
    "
    
    print_success "部署验证完成"
}

# 清理本地文件
cleanup_local() {
    print_info "清理本地文件..."
    
    # 清理临时文件
    rm -f .env.bak .env.backup
    
    print_success "本地清理完成"
}

# 显示部署结果
show_result() {
    print_separator
    print_success "🎉 部署完成!"
    echo ""
    echo "项目信息:"
    echo "  - 项目名称: ${PROJECT_NAME}"
    echo "  - 部署时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "  - 部署用户: $(whoami)"
    echo ""
    echo "服务器信息:"
    echo "  - 服务器: ${REMOTE_HOST}"
    echo "  - 部署路径: ${REMOTE_PATH}"
    echo "  - API地址: ${API_URL}"
    echo ""
    echo "访问地址:"
    echo "  - 前端: https://my.mynet.club"
    echo "  - API: ${API_URL}"
    echo ""
    print_info "部署信息已保存到服务器的 deployment-info.json 文件"
    print_separator
}

# =============================================================================
# 主程序流程
# =============================================================================

main() {
    # 显示脚本信息
    show_info
    
    # 确认部署操作
    confirm_action "即将开始部署 ${PROJECT_NAME} 到生产环境"
    
    # 检查环境依赖
    check_dependencies
    
    # 检查SSH连接
    check_ssh_connection
    
    # 安装依赖
    install_dependencies
    
    # 更新配置
    update_config
    
    # 构建项目
    build_project
    
    # 创建部署信息
    create_deployment_info
    
    # 备份远程文件
    backup_remote
    
    # 部署到服务器
    deploy_to_server
    
    # 设置权限
    set_remote_permissions
    
    # 重启Nginx
    restart_nginx
    
    # 验证部署
    verify_deployment
    
    # 清理本地文件
    cleanup_local
    
    # 显示结果
    show_result
}

# =============================================================================
# 错误处理
# =============================================================================

# 捕获错误信号
trap 'print_error "部署过程中发生错误，正在清理..."; cleanup_local; exit 1' ERR
trap 'print_info "部署被中断"; cleanup_local; exit 130' INT TERM

# =============================================================================
# 脚本入口
# =============================================================================

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

# 运行主程序
main "$@"
