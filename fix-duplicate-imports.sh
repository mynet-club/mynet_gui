#!/bin/bash

# 清理重复的 debug 导入语句脚本

set -e

echo "🔧 清理重复的 debug 导入语句..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 查找所有需要处理的文件
FILES=$(find src -name "*.ts" -o -name "*.js" -o -name "*.vue" | grep -v node_modules)

echo -e "${BLUE}开始清理重复导入...${NC}"

for file in $FILES; do
    if grep -q 'import debug from.*utils/debug' "$file" 2>/dev/null; then
        # 统计该文件中有多少个 debug 导入
        debug_imports=$(grep -c 'import debug from.*utils/debug' "$file" 2>/dev/null || echo "0")
        
        if [ "$debug_imports" -gt 1 ]; then
            echo "  清理文件: $file (发现 $debug_imports 个重复导入)"
            
            # 创建临时文件
            temp_file=$(mktemp)
            
            # 读取文件，只保留第一个 debug 导入，删除其余的
            awk '
                /import debug from.*utils\/debug/ {
                    if (!seen) {
                        print
                        seen = 1
                    }
                    next
                }
                { print }
            ' "$file" > "$temp_file"
            
            # 替换原文件
            mv "$temp_file" "$file"
        fi
    fi
done

echo -e "${GREEN}✅ 重复导入清理完成！${NC}"

# 验证清理结果
echo -e "${BLUE}验证清理结果...${NC}"
duplicate_count=0
for file in $FILES; do
    if grep -q 'import debug from.*utils/debug' "$file" 2>/dev/null; then
        debug_imports=$(grep -c 'import debug from.*utils/debug' "$file" 2>/dev/null || echo "0")
        if [ "$debug_imports" -gt 1 ]; then
            echo "⚠️  文件 $file 仍有 $debug_imports 个重复导入"
            duplicate_count=$((duplicate_count + 1))
        fi
    fi
done

if [ "$duplicate_count" -eq 0 ]; then
    echo -e "${GREEN}✅ 所有重复导入已清理完成！${NC}"
else
    echo -e "${YELLOW}⚠️  仍有 $duplicate_count 个文件存在重复导入${NC}"
fi