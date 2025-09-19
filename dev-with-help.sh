#!/bin/bash

# 帮助文档开发服务器脚本
# 在开发模式下复制帮助文档到 public 目录

echo "🚀 启动帮助文档开发服务器..."

# 创建目标目录
mkdir -p public/docs

# 复制帮助文档
echo "📚 复制帮助文档..."
cp -r docs/help public/docs/

echo "✅ 帮助文档已复制到 public/docs/help"
echo "🌐 可以通过 /docs/help/ 路径访问文档"

# 启动开发服务器
echo "🔧 启动 Quasar 开发服务器..."
quasar dev