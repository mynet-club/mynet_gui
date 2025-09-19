#!/bin/bash

# 移除 console.log 并替换为 debug 的批量替换脚本
# 使用方法: ./remove-console-logs.sh

set -e

echo "🔧 开始批量替换 console.* 为 debug.*"

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 统计函数
count_matches() {
    local pattern="$1"
    local count=$(find src -name "*.ts" -o -name "*.js" -o -name "*.vue" | xargs grep -l "$pattern" 2>/dev/null | wc -l || echo "0")
    echo "$count"
}

# 显示替换前的统计
echo -e "${BLUE}替换前统计:${NC}"
console_files=$(count_matches "console\.")
echo "包含 console.* 的文件数: $console_files"

if [ "$console_files" -eq 0 ]; then
    echo -e "${GREEN}✅ 没有找到 console.* 调用，无需替换${NC}"
    exit 0
fi

# 备份提示
echo -e "${YELLOW}⚠️  建议先提交当前代码到 git，以便回滚${NC}"
read -p "是否继续执行批量替换? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "操作已取消"
    exit 0
fi

echo -e "${BLUE}开始执行替换...${NC}"

# 查找所有需要处理的文件
FILES=$(find src -name "*.ts" -o -name "*.js" -o -name "*.vue" | grep -v node_modules)

# 替换步骤 1: 添加 debug 导入到需要的文件
echo "步骤 1: 添加 debug 导入..."
for file in $FILES; do
    # 检查文件是否包含 console.* 调用
    if grep -q "console\." "$file" 2>/dev/null; then
        # 检查是否已经有 debug 导入
        if ! grep -q "from.*@/utils/debug\|from.*\.\./utils/debug\|from.*utils/debug" "$file" 2>/dev/null; then
            # 获取文件的相对路径深度来计算正确的导入路径
            depth=$(echo "$file" | sed 's/[^/]*$//' | tr -cd '/' | wc -c)
            
            # 计算相对路径
            case $depth in
                1) import_path="../utils/debug" ;;  # src/ 目录
                2) import_path="../utils/debug" ;;  # src/pages/ 等
                3) import_path="../../utils/debug" ;; # src/pages/user/ 等
                4) import_path="../../../utils/debug" ;; # src/pages/user/components/ 等
                *) import_path="../utils/debug" ;;
            esac
            
            # 添加导入语句（在现有导入之后）
            if grep -q "^import" "$file"; then
                # 在最后一个 import 语句后添加
                sed -i '' '/^import.*$/a\
import debug from "'"$import_path"'"
' "$file"
            else
                # 在文件开头添加
                sed -i '' '1i\
import debug from "'"$import_path"'"
' "$file"
            fi
            echo "  已添加 debug 导入到: $file"
        fi
    fi
done

# 替换步骤 2: 替换 console.* 调用
echo "步骤 2: 替换 console.* 调用..."

# 替换各种 console 方法
sed -i '' 's/console\.log/debug.log/g' $FILES
sed -i '' 's/console\.info/debug.info/g' $FILES
sed -i '' 's/console\.warn/debug.warn/g' $FILES
sed -i '' 's/console\.error/debug.error/g' $FILES
sed -i '' 's/console\.debug/debug.debug/g' $FILES
sed -i '' 's/console\.table/debug.table/g' $FILES
sed -i '' 's/console\.group/debug.group/g' $FILES
sed -i '' 's/console\.groupCollapsed/debug.groupCollapsed/g' $FILES
sed -i '' 's/console\.groupEnd/debug.groupEnd/g' $FILES
sed -i '' 's/console\.time/debug.time/g' $FILES
sed -i '' 's/console\.timeEnd/debug.timeEnd/g' $FILES
sed -i '' 's/console\.timeLog/debug.timeLog/g' $FILES
sed -i '' 's/console\.trace/debug.trace/g' $FILES
sed -i '' 's/console\.assert/debug.assert/g' $FILES
sed -i '' 's/console\.count/debug.count/g' $FILES
sed -i '' 's/console\.countReset/debug.countReset/g' $FILES
sed -i '' 's/console\.clear/debug.clear/g' $FILES
sed -i '' 's/console\.dir/debug.dir/g' $FILES
sed -i '' 's/console\.dirxml/debug.dirxml/g' $FILES

echo "步骤 3: 处理特殊情况..."

# 处理一些特殊情况，比如 const originalConsoleLog = console.log
# 将这种赋值也替换为 debug
sed -i '' 's/= console\.log/= debug.log/g' $FILES
sed -i '' 's/= console\.info/= debug.info/g' $FILES
sed -i '' 's/= console\.warn/= debug.warn/g' $FILES
sed -i '' 's/= console\.error/= debug.error/g' $FILES

# 显示替换后的统计
echo -e "${BLUE}替换后统计:${NC}"
debug_files=$(count_matches "debug\.")
remaining_console_files=$(count_matches "console\.")
echo "包含 debug.* 的文件数: $debug_files"
echo "仍包含 console.* 的文件数: $remaining_console_files"

if [ "$remaining_console_files" -gt 0 ]; then
    echo -e "${YELLOW}仍有一些 console.* 调用未被替换，可能需要手动检查:${NC}"
    find src -name "*.ts" -o -name "*.js" -o -name "*.vue" | xargs grep -l "console\." 2>/dev/null | head -5
fi

echo -e "${GREEN}✅ 批量替换完成！${NC}"
echo -e "${BLUE}下一步：${NC}"
echo "1. 检查替换结果"
echo "2. 运行 npm run dev 测试开发环境"
echo "3. 运行 npm run build 测试生产环境构建"
echo "4. 如有问题，使用 git checkout . 恢复"