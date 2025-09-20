/**
 * VPN配置数据
 * 基于PHP配置文件转换为TypeScript格式
 */

import { VPNConfigData } from '../types/vpnConfig'

export const vpnConfigData: VPNConfigData = {
  gnb: {
    name: 'vpn.config.gnbVirtualNetwork',
    description: 'GNU Network Bridge - 去中心化P2P虚拟网络',
    enabled: true,
    supported_versions: ['default', 'v1.4.8', 'v1.4.7', 'v1.3.0'],
    default_version: 'default',
    versions: {
      default: {
        name: 'vpn.config.defaultVersion',
        interface_name: 'gnb_tun',
        default_port: 9001,
        recommended_mtu: 1400,
        config_file_extension: '.conf',
        modes: {
          base: {
            name: 'vpn.config.basicConfig',
            description: 'vpn.config.basicConfigDesc',
            parameters: {
              nodeid: {
                name: 'vpn.config.nodeId',
                type: 'integer',
                min: 1000000000000000,
                max: 9007199254740991,
                required: true,
                description: '节点唯一标识符，从IP池范围选择'
              },
              ifname: {
                name: 'vpn.config.networkInterface',
                type: 'string',
                default: 'gnb_tun',
                required: true,
                validation: '^[a-zA-Z0-9_]{1,15}$',
                description: 'GNB虚拟网卡接口名称'
              },
              listen: {
                name: 'vpn.config.listenPortConfig',
                type: 'integer',
                default: 9001,
                min: 1024,
                max: 65535,
                required: true,
                description: '节点监听的UDP端口号'
              },
              mtu: {
                name: 'vpn.config.mtu',
                type: 'integer',
                default: 1450,
                min: 1280,
                max: 9000,
                description: '网络最大传输单元（IPv6最小1280；典型1280~1450，推荐1450）'
              },
              multi_socket: {
                name: 'vpn.config.multiSocket',
                type: 'multi-button',
                default: 'off',
                options: {
                  'off': '禁用',
                  'on': '启用'
                },
                description: '多套接字打洞（NAT 环境下更好）'
              }
            }
          },
          expert: {
            name: 'vpn.config.expertConfig',
            description: '可选的高级参数配置，可不写入配置文件',
            parameters: {
              direct_forwarding: {
                name: 'vpn.config.directForwarding',
                type: 'multi-button',
                default: 'on',
                options: {
                  'off': '禁用',
                  'on': '启用'
                },
                description: '启用直接转发模式'
              },
              unified_forwarding: {
                name: 'vpn.config.unifiedForwarding',
                type: 'multi-button',
                default: 'auto',
                options: {
                  'off': '关闭',
                  'auto': '自动',
                  'force': '强制',
                  'super': 'Super模式',
                  'hyper': 'Hyper模式'
                },
                description: '统一转发模式配置'
              },
              standard_forwarding: {
                name: 'vpn.config.standardForwarding',
                type: 'multi-button',
                default: 'on',
                options: {
                  'off': '禁用',
                  'on': '启用'
                },
                description: '启用标准中继转发'
              },
              address_secure: {
                name: 'vpn.config.addressSecure',
                type: 'multi-button',
                default: 'on',
                options: {
                  'off': '禁用',
                  'on': '启用'
                },
                description: '启用地址安全验证机制'
              },
              ipv4_only: {
                name: 'vpn.config.ipv4Only',
                type: 'multi-button',
                default: 'off',
                options: {
                  'off': '禁用',
                  'on': '启用'
                },
                description: '仅使用 IPv4 套接字（与 ipv6_only 互斥）'
              },
              ipv6_only: {
                name: 'vpn.config.ipv6Only',
                type: 'multi-button',
                default: 'off',
                options: {
                  'off': '禁用',
                  'on': '启用'
                },
                description: '仅使用 IPv6 套接字（与 ipv4_only 互斥）'
              },
              keepalive: {
                name: 'vpn.config.keepalive',
                type: 'integer',
                default: 25,
                min: 1,
                max: 300,
                description: '发送保活包的间隔时间'
              },
              forward: {
                name: 'vpn.config.forward',
                type: 'multi-button',
                default: 'on',
                options: {
                  'off': '禁用',
                  'on': '启用'
                },
                description: '启用数据包转发功能'
              },
              daemon: {
                name: 'vpn.config.daemon',
                type: 'multi-button',
                default: 'on',
                options: {
                  'off': '禁用',
                  'on': '启用'
                },
                description: '以守护进程方式运行'
              },
              zip: {
                name: 'vpn.config.compression',
                type: 'multi-button',
                default: 'auto',
                options: {
                  'auto': 'auto',
                  'force': 'force'
                },
                description: '压缩策略'
              },
              zip_level: {
                name: 'vpn.config.compressionLevel',
                type: 'integer',
                default: -1,
                min: -1,
                max: 9,
                description: '-1(默认) ~ 9（9压缩比高但更耗CPU）'
              },
              memory: {
                name: 'vpn.config.memory',
                type: 'multi-button',
                default: 'tiny',
                options: {
                  'tiny': 'tiny',
                  'small': 'small',
                  'large': 'large',
                  'huge': 'huge'
                },
                description: '内存与缓存规模（tiny/small/large/huge）'
              },
              es_argv: {
                name: 'vpn.config.esArgs',
                type: 'string',
                default: '--upnp',
                description: '传给 gnb_es 的单个参数（如 --upnp）'
              }
            }
          }
        }
      }
    }
  },
  wireguard: {
    name: 'vpn.config.wireGuard',
    description: 'WireGuard - 现代高性能VPN协议',
    enabled: true,
    supported_versions: ['default', 'v1.0.0', 'v0.0.20201221'],
    default_version: 'default',
    versions: {
      default: {
        name: 'vpn.config.defaultVersion',
        interface_name: 'WG01',
        default_port: 51820,
        recommended_mtu: 1420,
        config_file_extension: '.conf',
        modes: {
          base: {
            name: 'vpn.config.basicConfig',
            description: 'vpn.config.wireGuardBasicDesc',
            parameters: {
              ifname: {
                name: 'vpn.config.networkInterface',
                type: 'string',
                default: 'WG01',
                required: true,
                validation: '^[a-zA-Z0-9_=+.-]{1,15}$',
                description: 'WireGuard网卡接口名称'
              },
              listen_address: {
                name: 'vpn.config.interfaceAddress',
                type: 'string',
                default: '10.0.0.1/24',
                required: true,
                description: 'WireGuard接口IP地址，CIDR格式'
              },
              listen_port: {
                name: 'vpn.config.listenPortConfig',
                type: 'integer',
                default: 51820,
                min: 1,
                max: 65535,
                required: true,
                description: 'WireGuard监听端口'
              },
              mtu: {
                name: 'vpn.config.mtu',
                type: 'integer',
                default: 1420,
                min: 1280,
                max: 9000,
                description: '网络最大传输单元，建议值：1420'
              },
              multi_socket: {
                name: 'vpn.config.multiConnection',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '支持多个并发连接'
              },
              ipv4_only: {
                name: 'vpn.config.ipv4Only',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '仅使用IPv4协议'
              },
              ipv6_only: {
                name: 'vpn.config.ipv6Only',
                type: 'select',
                default: 'off',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '仅使用IPv6协议'
              },
              daemon: {
                name: 'vpn.config.daemonMode',
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
            name: 'vpn.config.expertConfig',
            description: '可选的WireGuard高级参数配置',
            parameters: {
              dns: {
                name: 'vpn.config.dnsServers',
                type: 'string',
                default: '8.8.8.8,1.1.1.1',
                description: 'DNS服务器列表，逗号分隔'
              },
              persistent_keepalive: {
                name: 'vpn.config.persistentKeepalive',
                type: 'integer',
                default: 25,
                min: 0,
                max: 300,
                description: 'WireGuard保活间隔，0表示禁用'
              },
              allowed_ips: {
                name: 'vpn.config.allowedIPs',
                type: 'string',
                default: '0.0.0.0/0,::/0',
                description: '允许通过的IP范围，逗号分隔'
              },
              endpoint: {
                name: 'vpn.config.endpoint',
                type: 'string',
                default: '',
                description: '对端地址，格式：IP或域名:端口'
              },
              fwmark: {
                name: 'vpn.config.fwmark',
                type: 'integer',
                default: 0,
                min: 0,
                max: 4294967295,
                description: '防火墙标记，十六进制格式，0表示禁用'
              },
              table: {
                name: 'vpn.config.routeTable',
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
                name: 'vpn.config.saveConfigFile',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '自动保存配置更改'
              },
              pre_up: {
                name: 'vpn.config.preUpScript',
                type: 'text',
                default: '',
                description: '接口启动前执行的命令，%i代表接口名'
              },
              post_up: {
                name: 'vpn.config.postUpScript',
                type: 'text',
                default: '',
                description: '接口启动后执行的命令，常用于防火墙规则'
              },
              pre_down: {
                name: 'vpn.config.preDownScript',
                type: 'text',
                default: '',
                description: '接口停止前执行的命令'
              },
              post_down: {
                name: 'vpn.config.postDownScript',
                type: 'text',
                default: '',
                description: '接口停止后执行的命令，清理防火墙规则'
              },
              preshared_key: {
                name: 'vpn.config.presharedKey',
                type: 'string',
                default: '',
                description: '可选的预共享密钥，增强安全性'
              },
              roaming: {
                name: 'vpn.config.roaming',
                type: 'select',
                default: 'on',
                options: {
                  'on': '启用',
                  'off': '禁用'
                },
                description: '支持端点IP地址变化时自动更新'
              },
              handshake_timeout: {
                name: 'vpn.config.handshakeTimeout',
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
    name: 'vpn.config.openVPN',
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
