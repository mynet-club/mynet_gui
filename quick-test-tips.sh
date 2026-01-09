#!/bin/bash

# Tips系统快速验证脚本
# 使用方法: ./quick-test-tips.sh

echo "🎯 MyNet Tips系统快速验证"
echo "======================================"
echo ""

# 检查当前目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

echo "✅ 项目目录检查通过"
echo ""

# 检查必需文件
echo "📋 检查核心文件..."

files=(
    "src/types/tips.ts"
    "src/stores/onboarding.ts"
    "src/services/tips/TipsEngine.ts"
    "src/services/tips/TipsRegistry.ts"
    "src/composables/useTips.ts"
    "src/components/tips/TipsContainer.vue"
    "src/components/tips/WelcomeModal.vue"
    "src/components/tips/SpotlightGuide.vue"
    "src/layouts/MainLayout.vue"
    "src/App.vue"
)

missing_files=0
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        missing_files=$((missing_files + 1))
    fi
done

echo ""

if [ $missing_files -gt 0 ]; then
    echo "❌ 有 $missing_files 个文件缺失，请先完成实现"
    exit 1
fi

echo "✅ 所有核心文件检查通过"
echo ""

# 检查集成
echo "🔍 检查集成情况..."

# 检查MainLayout是否导入TipsContainer
if grep -q "TipsContainer" src/layouts/MainLayout.vue; then
    echo "  ✅ MainLayout已导入TipsContainer"
else
    echo "  ❌ MainLayout未导入TipsContainer"
    exit 1
fi

# 检查App.vue是否有调试工具
if grep -q "\$tips" src/App.vue; then
    echo "  ✅ App.vue已添加开发工具"
else
    echo "  ❌ App.vue未添加开发工具"
    exit 1
fi

# 检查目标标记
if grep -q "data-tip-target=\"create-ippool-btn\"" src/pages/ippool/IpPoolListPage.vue; then
    echo "  ✅ IP资源池按钮已标记"
else
    echo "  ⚠️  IP资源池按钮未标记"
fi

if grep -q "data-tip-target=\"add-device-btn\"" src/pages/node/NodeListPage.vue; then
    echo "  ✅ 节点添加按钮已标记"
else
    echo "  ⚠️  节点添加按钮未标记"
fi

echo ""
echo "✅ 集成检查完成"
echo ""

# 询问是否启动开发服务器
read -p "🚀 是否启动开发服务器进行测试? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 测试提示:"
    echo "------------------------------------"
    echo "1. 打开浏览器控制台 (F12)"
    echo "2. 查找 '💡 开发者工具已加载' 消息"
    echo "3. 使用以下命令测试:"
    echo ""
    echo "   \$tips.status()  - 查看引导状态"
    echo "   \$tips.reset()   - 重置引导"
    echo ""
    echo "4. 验证欢迎弹窗是否显示"
    echo "5. 导航到 /app/ippools 查看高亮引导"
    echo "------------------------------------"
    echo ""
    
    # 检查是否有yarn
    if command -v yarn &> /dev/null; then
        echo "🚀 启动开发服务器 (yarn)..."
        yarn dev
    else
        echo "🚀 启动开发服务器 (npm)..."
        npm run dev
    fi
else
    echo ""
    echo "👍 你可以随时手动启动:"
    echo "   yarn dev"
    echo "   或"
    echo "   npm run dev"
    echo ""
    echo "📚 详细测试步骤请查看:"
    echo "   docs/2026/INTEGRATION_VERIFICATION.md"
fi

echo ""
echo "✨ 完成!"
