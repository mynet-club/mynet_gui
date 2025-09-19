#!/bin/bash

# 修复 debug 导入路径脚本

set -e

echo "🔧 修复 debug 导入路径..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 查找所有需要处理的文件
FILES=$(find src -name "*.ts" -o -name "*.js" -o -name "*.vue" | grep -v node_modules)

echo -e "${BLUE}开始修复导入路径...${NC}"

for file in $FILES; do
    if grep -q 'import debug from.*utils/debug' "$file" 2>/dev/null; then
        # 计算文件相对于 src 的深度
        # 去掉 src/ 前缀，然后计算路径深度
        relative_path=${file#src/}
        depth=$(echo "$relative_path" | tr -cd '/' | wc -c)
        
        # 根据深度确定正确的导入路径
        case $depth in
            0) correct_path="./utils/debug" ;;      # src/ 直接下的文件
            1) correct_path="../utils/debug" ;;     # src/pages/ 等一级目录
            2) correct_path="../../utils/debug" ;;  # src/pages/auth/ 等二级目录
            3) correct_path="../../../utils/debug" ;; # src/pages/auth/components/ 等三级目录
            *) correct_path="../utils/debug" ;;     # 默认
        esac
        
        # 检查当前文件中的导入路径是否正确
        current_import=$(grep 'import debug from' "$file" | head -1)
        
        if [[ "$current_import" == *"$correct_path"* ]]; then
            # 路径已经正确
            continue
        else
            # 需要修复路径
            echo "  修复文件: $file (深度: $depth, 使用路径: $correct_path)"
            
            # 使用 sed 替换导入路径
            sed -i '' "s|import debug from \"[^\"]*utils/debug\"|import debug from \"$correct_path\"|g" "$file"
            sed -i '' "s|import debug from '[^']*utils/debug'|import debug from '$correct_path'|g" "$file"
        fi
    fi
done

echo -e "${GREEN}✅ 导入路径修复完成！${NC}"

# 验证修复结果
echo -e "${BLUE}验证修复结果...${NC}"
error_count=0
for file in $FILES; do
    if grep -q 'import debug from.*utils/debug' "$file" 2>/dev/null; then
        # 获取文件深度
        relative_path=${file#src/}
        depth=$(echo "$relative_path" | tr -cd '/' | wc -c)
        
        # 预期路径
        case $depth in
            0) expected_path="./utils/debug" ;;
            1) expected_path="../utils/debug" ;;
            2) expected_path="../../utils/debug" ;;
            3) expected_path="../../../utils/debug" ;;
            *) expected_path="../utils/debug" ;;
        esac
        
        # 检查实际路径
        actual_import=$(grep 'import debug from' "$file" | head -1)
        
        if [[ "$actual_import" != *"$expected_path"* ]]; then
            echo "⚠️  文件 $file 路径可能仍不正确"
            echo "     期望: $expected_path"
            echo "     实际: $actual_import"
            error_count=$((error_count + 1))
        fi
    fi
done

if [ "$error_count" -eq 0 ]; then
    echo -e "${GREEN}✅ 所有导入路径已修复！${NC}"
else
    echo -e "${YELLOW}⚠️  仍有 $error_count 个文件路径可能不正确${NC}"
fi