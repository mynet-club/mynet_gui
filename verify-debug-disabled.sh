#!/bin/bash

# 验证生产环境Debug模式关闭脚本
# 检查环境配置、构建产物等，确保debug模式在生产环境被正确关闭

echo "🔍 验证生产环境Debug模式配置..."

# 检查.env.production文件
echo ""
echo "📄 检查 .env.production 配置文件:"
if [ -f ".env.production" ]; then
    echo "✅ .env.production 文件存在"
    
    # 检查关键debug配置
    if grep -q "VITE_ENABLE_DEBUG=false" .env.production; then
        echo "✅ VITE_ENABLE_DEBUG=false"
    else
        echo "❌ VITE_ENABLE_DEBUG 未正确设置为 false"
    fi
    
    if grep -q "VITE_ENABLE_CONSOLE_LOG=false" .env.production; then
        echo "✅ VITE_ENABLE_CONSOLE_LOG=false"
    else
        echo "❌ VITE_ENABLE_CONSOLE_LOG 未正确设置为 false"
    fi
    
    if grep -q "VITE_LOG_LEVEL=error" .env.production; then
        echo "✅ VITE_LOG_LEVEL=error"
    else
        echo "⚠️  VITE_LOG_LEVEL 建议设置为 error"
    fi
else
    echo "❌ .env.production 文件不存在"
    exit 1
fi

# 检查debug工具配置
echo ""
echo "🛠️ 检查 debug 工具配置:"
if [ -f "src/utils/debug.ts" ]; then
    echo "✅ debug.ts 工具存在"
    
    # 检查是否正确使用环境变量
    if grep -q "VITE_ENABLE_DEBUG" src/utils/debug.ts; then
        echo "✅ debug工具使用 VITE_ENABLE_DEBUG 环境变量"
    else
        echo "❌ debug工具未使用 VITE_ENABLE_DEBUG 环境变量"
    fi
    
    if grep -q "VITE_ENABLE_CONSOLE_LOG" src/utils/debug.ts; then
        echo "✅ debug工具使用 VITE_ENABLE_CONSOLE_LOG 环境变量"
    else
        echo "❌ debug工具未使用 VITE_ENABLE_CONSOLE_LOG 环境变量"
    fi
else
    echo "❌ debug.ts 工具不存在"
fi

# 检查是否还有直接的console调用
echo ""
echo "🔍 检查直接的 console 调用:"
console_count=$(find src -name "*.vue" -o -name "*.ts" -o -name "*.js" | xargs grep -l "console\." | grep -v "debug.ts" | wc -l)
if [ "$console_count" -eq 0 ]; then
    echo "✅ 没有发现直接的 console 调用（除了 debug.ts）"
else
    echo "⚠️  发现 $console_count 个文件包含直接的 console 调用:"
    find src -name "*.vue" -o -name "*.ts" -o -name "*.js" | xargs grep -l "console\." | grep -v "debug.ts" | head -5
    echo "建议使用 debug 工具替代直接的 console 调用"
fi

# 检查构建配置
echo ""
echo "⚙️ 检查构建配置:"
if [ -f "quasar.config.ts" ]; then
    echo "✅ quasar.config.ts 配置文件存在"
    
    if grep -q "drop_console" quasar.config.ts; then
        echo "✅ 构建配置包含 console 移除选项"
    else
        echo "❌ 构建配置缺少 console 移除选项"
    fi
    
    if grep -q "drop_debugger" quasar.config.ts; then
        echo "✅ 构建配置包含 debugger 移除选项"
    else
        echo "❌ 构建配置缺少 debugger 移除选项"
    fi
else
    echo "❌ quasar.config.ts 配置文件不存在"
fi

# 如果存在构建产物，检查是否包含debug代码
echo ""
echo "📦 检查构建产物:"
if [ -d "dist/spa" ]; then
    echo "✅ 构建产物存在"
    
    # 检查是否还有console调用（应该被移除）
    js_files=$(find dist/spa -name "*.js" | head -3)
    if [ -n "$js_files" ]; then
        console_in_build=$(echo "$js_files" | xargs grep -l "console\." 2>/dev/null | wc -l)
        if [ "$console_in_build" -eq 0 ]; then
            echo "✅ 构建产物中没有 console 调用"
        else
            echo "⚠️  构建产物中仍包含 console 调用"
        fi
        
        # 检查debug相关字符串
        debug_in_build=$(echo "$js_files" | xargs grep -l "debug\|DEBUG" 2>/dev/null | wc -l)
        if [ "$debug_in_build" -eq 0 ]; then
            echo "✅ 构建产物中没有debug相关代码"
        else
            echo "ℹ️  构建产物中包含debug相关字符串（可能正常）"
        fi
    fi
else
    echo "ℹ️  构建产物不存在，运行 'npm run build' 生成构建产物以进行检查"
fi

echo ""
echo "🎯 验证完成！"
echo ""
echo "📋 总结:"
echo "- 生产环境debug模式应该被关闭"
echo "- 构建时会自动移除console调用" 
echo "- debug工具会根据环境变量控制输出"
echo "- 只有error级别的日志在生产环境显示"