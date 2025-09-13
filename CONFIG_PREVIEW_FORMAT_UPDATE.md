# 配置预览格式调整记录

## 修改概述

根据用户需求，对节点配置页面的**完整配置预览**进行格式调整：
1. 参数名中的下划线 `_` 替换为连字符 `-`
2. GNB格式中的等号 `=` 替换为空格

## 修改前后对比

### GNB配置格式

**修改前：**
```bash
# GNB 节点配置文件
nodeid=7175750762685433
ifname=gnb_tun
listen_address=0.0.0.0
listen_port=9001
multi_socket=on
direct_forwarding=on
zip_level=-1
```

**修改后：**
```bash
# GNB 节点配置文件  
nodeid 7175750762685433
ifname gnb_tun
listen-address 0.0.0.0
listen-port 9001
multi-socket on
direct-forwarding on
zip-level -1
```

### WireGuard配置格式

**保持不变**（WireGuard标准格式）：
```ini
[Interface]
Address = 10.0.0.1/24
ListenPort = 51820
private_key = xxxxx
```

## 修改的文件

### `/src/pages/node/edit/NodeConfigPage.vue`

**修改的函数**: `renderConfigSection`

**核心变更**:
```javascript
// 转换参数名：下划线换成连字符
const configKey = key.replace(/_/g, '-')

if (isWireGuard) {
  lines.push(`${configKey} = ${value}`)  // WireGuard保持 = 格式
} else {
  lines.push(`${configKey} ${value}`)    // GNB使用空格格式
}
```

### `/src/pages/node/edit/NodeConfigPageNew.vue`

**修改的部分**: `configPreview` computed函数

**GNB网络配置部分**:
```javascript
config.push(`nodeid ${nodeId.value}`)
config.push(`ifname ${formData.value.ifname || 'gnb_tun'}`)
config.push(`listen-address ${formData.value.listen_address || '0.0.0.0'}`)
config.push(`listen-port ${formData.value.listen_port || 9001}`)
```

**GNB参数配置部分**:
```javascript
const configKey = key.replace(/_/g, '-')
config.push(`${prefix}${configKey} ${value}${isCurrentMode ? ' (当前编辑)' : ''}`)
```

**WireGuard部分**: 保持原有的 `key=value` 格式

## 参数名转换示例

| 原参数名 | 转换后 | 用途 |
|---------|--------|------|
| `listen_address` | `listen-address` | 监听地址 |
| `listen_port` | `listen-port` | 监听端口 |
| `multi_socket` | `multi-socket` | 多路复用 |
| `direct_forwarding` | `direct-forwarding` | 直接转发 |
| `unified_forwarding` | `unified-forwarding` | 统一转发 |
| `standard_forwarding` | `standard-forwarding` | 标准转发 |
| `address_secure` | `address-secure` | 地址安全 |
| `ipv4_only` | `ipv4-only` | 仅IPv4 |
| `ipv6_only` | `ipv6-only` | 仅IPv6 |
| `zip_level` | `zip-level` | 压缩等级 |

## 功能影响

### ✅ 兼容性
- **数据处理**: 内部仍使用下划线格式，只在显示时转换
- **API接口**: 无变化，仍使用原有的字段名
- **数据存储**: 无变化，不影响后端数据结构

### ✅ 用户体验
- **配置文件更标准**: 符合常见配置文件的命名约定
- **视觉效果更清晰**: 空格分隔比等号更易读
- **复制粘贴友好**: 生成的配置可直接用于实际部署

### ✅ 跨协议一致性
- **GNB**: 使用 `key value` 格式（空格分隔）
- **WireGuard**: 保持 `key = value` 格式（标准格式）
- **分别适配**: 根据VPN类型使用合适的格式

## 测试验证

### 预期效果
1. ✅ GNB配置预览显示为 `listen-address 0.0.0.0` 格式
2. ✅ WireGuard配置预览仍为 `Address = 10.0.0.1/24` 格式  
3. ✅ 复制配置功能正常工作
4. ✅ 下载配置文件功能正常
5. ✅ 所有下划线参数名都转换为连字符

### 验证步骤
1. 打开节点配置页面
2. 填写各种配置参数
3. 查看右侧配置预览
4. 测试复制和下载功能
5. 验证不同VPN类型的格式差异

## 版本信息
- 修改日期：2025年8月31日
- 影响范围：配置预览显示
- 兼容性：完全向后兼容
- 类型：UI优化
