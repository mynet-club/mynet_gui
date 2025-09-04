/**
 * VPN配置数据
 * 基于PHP配置文件转换为TypeScript格式
 */

import { VPNConfigData } from '../types/vpnConfig'

export const vpnConfigData: VPNConfigData = {
  gnb: {
    name: 'GNB虚拟网络',
    description: 'GNU Network Bridge - 去中心化P2P虚拟网络',
    enabled: true,
    supported_versions: ['default', 'v1.4.8', 'v1.4.7', 'v1.3.0'],
    default_version: 'default',
    versions: {
      default: {
        name: '默认版本 (Latest)',
        interface_name: 'gnb_tun',
        default_port: 9001,
        recommended_mtu: 1400,
        config_file_extension: '.conf',
        modes: {
          base: {
            name: '基本配置',
            description: '必需的基础参数配置',
            parameters: {
              nodeid: {
                name: '节点ID',
                type: 'integer',
                min: 1000000000000000,
                max: 9007199254740991,
                required: true,
                description: '节点唯一标识符，从IP池范围选择'
              },
              ifname: {
                name: '网络接口名称',
                type: 'string',
                default: 'gnb_tun',
                required: true,
                validation: '^[a-zA-Z0-9_]{1,15}$',
                description: 'GNB虚拟网卡接口名称'
              },
              listen_address: {
                name: '监听地址',
                type: 'string',
                default: '0.0.0.0',
                required: true,
                description: '节点监听的IP地址'
              },
              listen_port: {
                name: '监听端口',
                type: 'integer',
                default: 9001,
                min: 1,
                max: 65535,
                required: true,
                description: '节点监听的UDP端口号'
              },
              mtu: {
                name: 'MTU (最大传输单元)',
                type: 'integer',
                default: 1400,
                min: 576,
                max: 9000,
                description: '网络最大传输单元，建议值：1400'
              },
              multi_socket: {
                name: '多路复用',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '启用多路复用功能提高连接稳定性'
              },
              ipv4_only: {
                name: '仅IPv4',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '仅使用IPv4协议'
              },
              ipv6_only: {
                name: '仅IPv6',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '仅使用IPv6协议'
              },
              daemon: {
                name: '守护进程',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '以守护进程方式运行'
              }
            }
          },
          expert: {
            name: '专家配置',
            description: '可选的高级参数配置，可不写入配置文件',
            parameters: {
              listen6: {
                name: 'IPv6地址前缀',
                type: 'string',
                default: '::',
                description: 'IPv6网络地址前缀，用于配置IPv6网络范围'
              },
              ctl_block: {
                name: '控制阻塞',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '控制包阻塞机制'
              },
              direct_forwarding: {
                name: '直接转发',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '启用直接转发模式'
              },
              unified_forwarding: {
                name: '统一转发',
                type: 'select',
                default: 'super',
                options: {
                  'super': 'Super模式',
                  'on': '启用',
                  'off': '禁用'
                },
                description: '统一转发模式配置'
              },
              address_secure: {
                name: '地址安全',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '启用地址安全验证机制'
              },
              quiet: {
                name: '静默模式',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '启用静默模式，减少日志输出'
              },
              set_tun: {
                name: '设置TUN接口',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '自动设置TUN网络接口'
              },
              node_worker: {
                name: '节点工作线程数',
                type: 'integer',
                default: 4,
                min: 1,
                max: 32,
                description: '节点处理工作线程数量'
              },
              index_worker: {
                name: '索引工作线程数',
                type: 'integer',
                default: 0,
                min: 0,
                max: 16,
                description: '索引处理工作线程数量'
              },
              index_service_worker: {
                name: '索引服务工作线程数',
                type: 'integer',
                default: 0,
                min: 0,
                max: 16,
                description: '索引服务工作线程数量'
              },
              node_detect_worker: {
                name: '节点检测工作线程数',
                type: 'integer',
                default: 4,
                min: 0,
                max: 16,
                description: '节点检测工作线程数量，0表示关闭'
              },
              port_detect_range: {
                name: '端口检测范围',
                type: 'string',
                default: '10000-60000',
                validation: '^\\d+-\\d+$',
                description: '端口检测范围，格式：起始端口-结束端口'
              },
              keepalive: {
                name: '保活间隔(秒)',
                type: 'integer',
                default: 25,
                min: 1,
                max: 300,
                description: '发送保活包的间隔时间'
              },
              forward: {
                name: '转发功能',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '启用数据包转发功能'
              },
              pid_file: {
                name: 'PID文件路径',
                type: 'string',
                default: '/var/run/gnb.pid',
                description: '进程ID文件存储路径'
              },
              node_cache_file: {
                name: '节点缓存文件',
                type: 'string',
                default: '/var/lib/gnb/node_cache',
                description: '节点缓存数据文件路径'
              },
              log_file_path: {
                name: '日志文件路径',
                type: 'string',
                default: '/var/log/gnb/gnb.log',
                description: 'GNB日志文件存储路径'
              },
              log_udp4: {
                name: 'UDP4日志地址',
                type: 'string',
                default: '',
                description: 'UDP4日志服务器地址，格式：IP:端口'
              },
              es_argv: {
                name: 'ES参数',
                type: 'string',
                default: '--upnp',
                description: 'ES(Enhanced Security)高级参数，如--upnp启用UPnP'
              }
            }
          }
        }
      }
    }
  },
  wireguard: {
    name: 'WireGuard',
    description: 'WireGuard - 现代高性能VPN协议',
    enabled: true,
    supported_versions: ['default', 'v1.0.0', 'v0.0.20201221'],
    default_version: 'default',
    versions: {
      default: {
        name: '默认版本 (Latest)',
        interface_name: 'WG01',
        default_port: 51820,
        recommended_mtu: 1420,
        config_file_extension: '.conf',
        modes: {
          base: {
            name: '基本配置',
            description: '必需的WireGuard基础参数',
            parameters: {
              ifname: {
                name: '网络接口名称',
                type: 'string',
                default: 'WG01',
                required: true,
                validation: '^[a-zA-Z0-9_=+.-]{1,15}$',
                description: 'WireGuard网卡接口名称'
              },
              listen_address: {
                name: '接口地址',
                type: 'string',
                default: '10.0.0.1/24',
                required: true,
                description: 'WireGuard接口IP地址，CIDR格式'
              },
              listen_port: {
                name: '监听端口',
                type: 'integer',
                default: 51820,
                min: 1,
                max: 65535,
                required: true,
                description: 'WireGuard监听端口'
              },
              mtu: {
                name: 'MTU (最大传输单元)',
                type: 'integer',
                default: 1420,
                min: 1280,
                max: 9000,
                description: '网络最大传输单元，建议值：1420'
              },
              multi_socket: {
                name: '多连接支持',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '支持多个并发连接'
              },
              ipv4_only: {
                name: '仅IPv4',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '仅使用IPv4协议'
              },
              ipv6_only: {
                name: '仅IPv6',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '仅使用IPv6协议'
              },
              daemon: {
                name: '守护进程模式',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '以守护进程方式运行'
              }
            }
          },
          expert: {
            name: '专家配置',
            description: '可选的WireGuard高级参数配置',
            parameters: {
              dns: {
                name: 'DNS服务器',
                type: 'string',
                default: '8.8.8.8,1.1.1.1',
                description: 'DNS服务器列表，逗号分隔'
              },
              persistent_keepalive: {
                name: '持续保活(秒)',
                type: 'integer',
                default: 25,
                min: 0,
                max: 300,
                description: 'WireGuard保活间隔，0表示禁用'
              },
              allowed_ips: {
                name: '允许的IP',
                type: 'string',
                default: '0.0.0.0/0,::/0',
                description: '允许通过的IP范围，逗号分隔'
              },
              endpoint: {
                name: '端点地址',
                type: 'string',
                default: '',
                description: '对端地址，格式：IP或域名:端口'
              },
              fwmark: {
                name: 'FwMark防火墙标记',
                type: 'integer',
                default: 0,
                min: 0,
                max: 4294967295,
                description: '防火墙标记，十六进制格式，0表示禁用'
              },
              table: {
                name: '路由表',
                type: 'string',
                default: 'auto',
                options: {
                  'auto': '自动',
                  'off': '禁用',
                  'main': '主路由表'
                },
                description: '路由表设置，auto/off/数字'
              },
              save_config: {
                name: '保存配置',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '自动保存配置更改'
              },
              pre_up: {
                name: '启动前脚本',
                type: 'text',
                default: '',
                description: '接口启动前执行的命令，%i代表接口名'
              },
              post_up: {
                name: '启动后脚本',
                type: 'text',
                default: '',
                description: '接口启动后执行的命令，常用于防火墙规则'
              },
              pre_down: {
                name: '停止前脚本',
                type: 'text',
                default: '',
                description: '接口停止前执行的命令'
              },
              post_down: {
                name: '停止后脚本',
                type: 'text',
                default: '',
                description: '接口停止后执行的命令，清理防火墙规则'
              },
              preshared_key: {
                name: '预共享密钥',
                type: 'string',
                default: '',
                description: '可选的预共享密钥，增强安全性'
              },
              roaming: {
                name: '漫游支持',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '支持端点IP地址变化时自动更新'
              },
              handshake_timeout: {
                name: '握手超时(秒)',
                type: 'integer',
                default: 180,
                min: 1,
                max: 3600,
                description: 'WireGuard握手超时时间'
              }
            }
          }
        }
      }
    }
  },
  openvpn: {
    name: 'OpenVPN',
    description: 'OpenVPN - 传统VPN解决方案',
    enabled: false,
    supported_versions: ['default', 'v2.6.0', 'v2.5.0'],
    default_version: 'default',
    versions: {}
  },
  global: {
    default_vpn_type: 'gnb',
    default_mode: 'base',
    node_id_ranges: {
      min: 1000000000,
      max: 9999999999999999
    },
    port_ranges: {
      gnb: [9000, 9999],
      wireguard: [51820, 51920],
      openvpn: [1194, 1294]
    },
    validation_rules: {
      port: 'integer|min:1|max:65535',
      mtu: 'integer|min:576|max:9000',
      ip: 'ip',
      cidr: 'regex:/^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\/[0-9]{1,2}$/',
      interface_name: 'regex:/^[a-zA-Z0-9_=+.-]{1,15}$/',
      base64: 'regex:/^[A-Za-z0-9+\\/=]+$/'
    }
  }
}
