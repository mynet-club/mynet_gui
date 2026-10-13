#!/bin/bash

# 部署前检查脚本
# Pre-deployment Check Script

set -e

# 部署目标唯一来源（与 deployment.sh/quick-deploy.sh/rollback.sh 同源）
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/deploy-target.sh"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

check_passed=true

print_info "开始部署前检查..."

# 检查Node.js版本
print_info "检查Node.js版本..."
NODE_VERSION=$(node --version | sed 's/v//')
REQUIRED_NODE_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE_VERSION" ]; then
    print_success "Node.js版本检查通过: $NODE_VERSION"
else
    print_error "Node.js版本过低: ${NODE_VERSION}，需要 >= $REQUIRED_NODE_VERSION"
    check_passed=false
fi

# 检查npm版本
print_info "检查npm版本..."
NPM_VERSION=$(npm --version)
print_success "npm版本: $NPM_VERSION"

# 检查依赖安装
print_info "检查项目依赖..."
if [ -f "package-lock.json" ]; then
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules目录不存在，需要安装依赖"
    else
        print_success "依赖已安装"
    fi
else
    print_warning "未找到package-lock.json文件"
fi

# 检查TypeScript编译
print_info "检查TypeScript编译..."
if npm run build -- --dry-run 2>/dev/null; then
    print_success "TypeScript编译检查通过"
else
    print_warning "TypeScript编译检查失败，将在实际构建时处理"
fi

# 检查Lint
print_info "检查代码质量..."
if npm run lint 2>/dev/null; then
    print_success "代码质量检查通过"
else
    print_warning "代码质量检查有警告，建议修复后再部署"
fi

# 检查环境变量
print_info "检查环境配置..."
if [ -f ".env.prod" ]; then
    print_success "生产环境配置文件存在"
else
    print_warning "未找到.env.prod文件"
fi

# 检查Git状态
print_info "检查Git状态..."
if [ -d ".git" ]; then
    if git diff --quiet && git diff --cached --quiet; then
        print_success "Git工作区干净"
    else
        print_warning "Git工作区有未提交的修改"
    fi
    
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    print_info "当前分支: $BRANCH"
    
    if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
        print_success "在主分支上"
    else
        print_warning "不在主分支上，当前分支: $BRANCH"
    fi
else
    print_warning "不是Git仓库"
fi

# 检查SSH连接
print_info "检查SSH连接..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${REMOTE_USER}@${REMOTE_HOST} exit 2>/dev/null; then
    print_success "SSH连接正常"
else
    print_error "SSH连接失败，请检查SSH密钥配置"
    check_passed=false
fi

# 检查远程目录权限
print_info "检查远程目录权限..."
if ssh ${REMOTE_USER}@${REMOTE_HOST} "test -w '${REMOTE_PATH}' || mkdir -p '${REMOTE_PATH}'" 2>/dev/null; then
    print_success "远程目录权限正常"
else
    print_error "远程目录权限检查失败"
    check_passed=false
fi

# 检查Nginx配置
print_info "检查Nginx配置..."
if ssh ${REMOTE_USER}@${REMOTE_HOST} "nginx -t" 2>/dev/null; then
    print_success "Nginx配置语法正确"
else
    print_warning "Nginx配置可能有问题"
fi

# 总结检查结果
echo ""
if [ "$check_passed" = true ]; then
    print_success "✅ 所有关键检查项都通过，可以进行部署"
    exit 0
else
    print_error "❌ 部分关键检查项失败，请修复后再部署"
    exit 1
fi
