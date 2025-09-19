#!/bin/bash

# 批量修复硬编码路径脚本

echo "开始修复硬编码路径..."

# 修复 /routes/ 路径为 /app/routes/
find src -name "*.vue" -type f -exec sed -i '' "s|router\.push('/routes|router.push('/app/routes|g" {} \;
find src -name "*.vue" -type f -exec sed -i '' "s|router\.push(\`/routes|router.push(\`/app/routes|g" {} \;

# 修复 /social 路径为 /app/social
find src -name "*.vue" -type f -exec sed -i '' "s|router\.push('/social|router.push('/app/social|g" {} \;
find src -name "*.vue" -type f -exec sed -i '' "s|router\.push(\`/social|router.push(\`/app/social|g" {} \;

# 修复 to="/routes 和 to="/social
find src -name "*.vue" -type f -exec sed -i '' 's|to="/routes|to="/app/routes|g' {} \;
find src -name "*.vue" -type f -exec sed -i '' 's|to="/social|to="/app/social|g' {} \;

echo "修复完成！"
echo "请检查以下文件的修改："
echo "- 路由相关页面"
echo "- 社交相关页面"
echo "- 确保所有路径都以 /app/ 开头"