#!/usr/bin/env node

/**
 * 国际化键值检查脚本
 * 扫描 .vue 文件中的 $t() 调用，检查是否在 i18n 文件中定义
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// 配置
const CONFIG = {
  srcDir: '../src',
  i18nFiles: {
    zhCN: './src/i18n/zh-CN.ts',
    enUS: './src/i18n/en-US.ts'
  },
  vuePattern: './src/**/*.vue',
  tsPattern: './src/**/*.ts'
};

// 从文件中提取所有 $t('...') 调用
function extractI18nKeys(content, filePath) {
  const keys = new Set();
  
  // 匹配 $t('key') 或 $t("key")
  const patterns = [
    /\$t\(['"]([^'"]+)['"]\)/g,
    /\bt\(['"]([^'"]+)['"]\)/g,  // 匹配 setup 中的 t('key')
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      keys.add(match[1]);
    }
  });
  
  return Array.from(keys);
}

// 从 i18n 文件中提取所有已定义的键
function extractDefinedKeys(i18nContent) {
  const keys = new Set();
  
  // 使用正则提取所有键定义（更简单可靠）
  // 匹配 key: 'value' 或 key: "value" 或 key: `value`
  const keyPattern = /^\s*([a-zA-Z_][\w]*)\s*:/gm;
  
  let match;
  const lines = i18nContent.split('\n');
  const keyPath = [];
  
  lines.forEach(line => {
    // 跳过注释行
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return;
    }
    
    // 计算缩进层级
    const indent = line.search(/\S/);
    if (indent === -1) return;
    
    // 检测对象开始 {
    if (line.includes('{')) {
      // 支持带引号和不带引号的键名
      const keyMatch = line.match(/^\s*(['"])?([a-zA-Z_][\w]*)\1?\s*:\s*\{/);
      if (keyMatch) {
        keyPath[indent / 2] = keyMatch[2];
        keyPath.length = indent / 2 + 1;
        
        // 添加这个对象路径
        const fullKey = keyPath.filter(Boolean).join('.');
        if (fullKey) keys.add(fullKey);
      }
    }
    
    // 检测键值对（支持带引号的键名，包括以数字开头的键）
    const valueMatch = line.match(/^\s*(['"])?([a-zA-Z_\d][\w]*)\1?\s*:\s*['"`]/);
    if (valueMatch) {
      keyPath[indent / 2] = valueMatch[2];
      keyPath.length = indent / 2 + 1;
      
      const fullKey = keyPath.filter(Boolean).join('.');
      if (fullKey) keys.add(fullKey);
    }
    
    // 检测对象结束 }
    if (line.trim() === '},') {
      const closeBraceIndent = indent / 2;
      keyPath.length = closeBraceIndent;
    }
  });
  
  return keys;
}

// 主检查函数
async function checkI18n() {
  console.log('🔍 开始检查国际化键值...\n');
  
  // 使用 import.meta.url 获取当前文件所在目录
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const projectRoot = path.resolve(__dirname, '..');
  
  // 读取 i18n 文件
  const zhCNPath = path.join(projectRoot, CONFIG.i18nFiles.zhCN);
  const enUSPath = path.join(projectRoot, CONFIG.i18nFiles.enUS);
  
  const zhCNContent = fs.readFileSync(zhCNPath, 'utf-8');
  const enUSContent = fs.readFileSync(enUSPath, 'utf-8');
  
  const zhCNKeys = extractDefinedKeys(zhCNContent);
  const enUSKeys = extractDefinedKeys(enUSContent);
  
  console.log(`📚 中文键数量: ${zhCNKeys.size}`);
  console.log(`📚 英文键数量: ${enUSKeys.size}\n`);
  
  // 扫描 Vue 文件
  const vuePattern = path.join(projectRoot, CONFIG.vuePattern);
  const tsPattern = path.join(projectRoot, CONFIG.tsPattern);
  const vueFiles = glob.sync(vuePattern);
  const tsFiles = glob.sync(tsPattern);
  const allFiles = [...vueFiles, ...tsFiles];
  
  const usedKeys = new Map(); // key -> [files]
  const missingInZhCN = new Set();
  const missingInEnUS = new Set();
  const inconsistentKeys = new Set();
  
  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const keys = extractI18nKeys(content, file);
    
    keys.forEach(key => {
      if (!usedKeys.has(key)) {
        usedKeys.set(key, []);
      }
      usedKeys.get(key).push(file);
      
      if (!zhCNKeys.has(key)) {
        missingInZhCN.add(key);
      }
      if (!enUSKeys.has(key)) {
        missingInEnUS.add(key);
      }
      if (zhCNKeys.has(key) !== enUSKeys.has(key)) {
        inconsistentKeys.add(key);
      }
    });
  });
  
  console.log(`📁 扫描文件数: ${allFiles.length}`);
  console.log(`🔑 使用的键数量: ${usedKeys.size}\n`);
  
  // 报告缺失的键
  if (missingInZhCN.size > 0) {
    console.log('❌ 中文翻译缺失的键:');
    Array.from(missingInZhCN).sort().forEach(key => {
      const files = usedKeys.get(key);
      console.log(`  - ${key}`);
      console.log(`    使用位置: ${files.slice(0, 2).join(', ')}${files.length > 2 ? ` (+${files.length - 2} more)` : ''}`);
    });
    console.log('');
  }
  
  if (missingInEnUS.size > 0) {
    console.log('❌ 英文翻译缺失的键:');
    Array.from(missingInEnUS).sort().forEach(key => {
      const files = usedKeys.get(key);
      console.log(`  - ${key}`);
      console.log(`    使用位置: ${files.slice(0, 2).join(', ')}${files.length > 2 ? ` (+${files.length - 2} more)` : ''}`);
    });
    console.log('');
  }
  
  if (inconsistentKeys.size > 0) {
    console.log('⚠️  中英文不一致的键:');
    Array.from(inconsistentKeys).sort().forEach(key => {
      console.log(`  - ${key} (${zhCNKeys.has(key) ? '有中文' : '缺中文'}, ${enUSKeys.has(key) ? '有英文' : '缺英文'})`);
    });
    console.log('');
  }
  
  // 统计结果
  const totalIssues = missingInZhCN.size + missingInEnUS.size;
  
  if (totalIssues === 0) {
    console.log('✅ 所有国际化键值检查通过！');
  } else {
    console.log(`\n📊 总计发现 ${totalIssues} 个问题`);
    console.log(`   - 缺失中文: ${missingInZhCN.size}`);
    console.log(`   - 缺失英文: ${missingInEnUS.size}`);
    process.exit(1);
  }
}

// 运行检查
checkI18n().catch(error => {
  console.error('检查失败:', error);
  process.exit(1);
});
