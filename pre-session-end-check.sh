#!/bin/bash

# 会话结束检查脚本
# 用于确保代码质量和规范性

echo "🔍 开始会话结束检查..."
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 错误计数
ERROR_COUNT=0

# 1. 代码格式检查
echo "📝 检查代码格式..."
if npm run lint --silent 2>&1 | grep -q "ESLint couldn't find"; then
  echo -e "${YELLOW}⚠ ESLint 配置未找到，跳过 lint 检查${NC}"
else
  if npm run lint --silent; then
    echo -e "${GREEN}✓ 代码格式检查通过${NC}"
  else
    echo -e "${RED}✗ 代码格式检查失败${NC}"
    echo "  运行 'npm run lint:fix' 修复大部分问题"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  fi
fi
echo ""

# 2. TypeScript 类型检查
echo "🔧 检查 TypeScript 类型..."
if npm run type-check --silent; then
  echo -e "${GREEN}✓ TypeScript 类型检查通过${NC}"
else
  echo -e "${RED}✗ TypeScript 类型检查失败${NC}"
  ERROR_COUNT=$((ERROR_COUNT + 1))
fi
echo ""

# 3. 构建测试
echo "🏗️  测试生产构建..."
if npm run build --silent > /dev/null 2>&1; then
  echo -e "${GREEN}✓ 生产构建成功${NC}"
  # 清理构建产物
  rm -rf dist
else
  echo -e "${RED}✗ 生产构建失败${NC}"
  echo "  查看详细错误: npm run build"
  ERROR_COUNT=$((ERROR_COUNT + 1))
fi
echo ""

# 4. 检查未提交的文件
echo "📦 检查未提交的文件..."
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${YELLOW}⚠ 存在未提交的文件:${NC}"
  git status --short
  echo ""
else
  echo -e "${GREEN}✓ 所有更改已提交${NC}"
fi
echo ""

# 5. 检查 console.log（警告但不阻止）
echo "🔍 检查调试代码..."
CONSOLE_COUNT=$(git grep -n "console\\.log" -- "*.vue" "*.ts" "*.js" 2>/dev/null | grep -v "node_modules" | wc -l)
if [ "$CONSOLE_COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠ 发现 $CONSOLE_COUNT 处 console.log${NC}"
  echo "  建议在提交前移除调试代码"
else
  echo -e "${GREEN}✓ 无调试代码${NC}"
fi
echo ""

# 6. 检查硬编码文本（简单检测）
echo "🌐 检查硬编码文本..."
# 检查最近修改的 .vue 文件中是否有中文字符（简化版）
RECENT_FILES=$(git diff --name-only HEAD~1 2>/dev/null | grep "\.vue$")
if [ -n "$RECENT_FILES" ]; then
  HARDCODED_COUNT=0
  for file in $RECENT_FILES; do
    if [ -f "$file" ]; then
      # 简单检查文件中是否有中文（使用 LC_ALL=C 避免 locale 问题）
      if LC_ALL=C grep -q '[\x80-\xff]' "$file" 2>/dev/null; then
        HARDCODED_COUNT=$((HARDCODED_COUNT + 1))
        echo -e "${YELLOW}  ⚠ $file 可能包含硬编码中文${NC}"
      fi
    fi
  done
  
  if [ "$HARDCODED_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✓ 未发现明显的硬编码文本${NC}"
  else
    echo -e "${YELLOW}⚠ 建议检查国际化是否完整${NC}"
  fi
else
  echo -e "${GREEN}✓ 无最近修改的 .vue 文件${NC}"
fi
echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ERROR_COUNT -eq 0 ]; then
  echo -e "${GREEN}✅ 所有检查通过！可以结束会话。${NC}"
  exit 0
else
  echo -e "${RED}❌ 发现 $ERROR_COUNT 个错误，请修复后再提交。${NC}"
  exit 1
fi
