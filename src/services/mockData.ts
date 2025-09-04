// 模拟数据服务
export interface MockUser {
  id: string
  name: string
  email: string
  zone_id: string
  permissions: string[]
  avatar?: string
}

export interface MockZone {
  id: string
  name: string
  is_active: boolean
  description: string
}

export interface MockNode {
  id: string
  node_name: string
  node_type: string
  ip_address: string
  port: number
  status: 'active' | 'inactive' | 'pending'
  zone_id: string
  created_at: string
  updated_at: string
}

export interface MockRoute {
  id: string
  name: string
  destination: string
  gateway: string
  status: 'active' | 'inactive'
  zone_id: string
  created_at: string
}

// 模拟用户数据
export const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    zone_id: 'zone_1',
    permissions: ['read', 'write', 'admin'],
    avatar: 'https://via.placeholder.com/150'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    zone_id: 'zone_2',
    permissions: ['read', 'write'],
    avatar: 'https://via.placeholder.com/150'
  }
]

// 模拟区域数据
export const mockZones: MockZone[] = [
  {
    id: 'zone_1',
    name: 'TechCorpVPN',
    is_active: true,
    description: 'Technology Corporation VPN Network'
  },
  {
    id: 'zone_2',
    name: 'GlobalBizVPN',
    is_active: true,
    description: 'Global Business Solutions VPN Network'
  },
  {
    id: 'zone_3',
    name: 'SecureNetVPN',
    is_active: false,
    description: 'Secure Network Services VPN (Maintenance Mode)'
  }
]

// 模拟节点数据
export const mockNodes: MockNode[] = [
  {
    id: 'node_1',
    node_name: 'AP-Gateway-01',
    node_type: 'Gateway',
    ip_address: '192.168.1.1',
    port: 8080,
    status: 'active',
    zone_id: 'zone_1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'node_2',
    node_name: 'AP-Server-01',
    node_type: 'Server',
    ip_address: '192.168.1.2',
    port: 8080,
    status: 'active',
    zone_id: 'zone_1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'node_3',
    node_name: 'EU-Gateway-01',
    node_type: 'Gateway',
    ip_address: '192.168.2.1',
    port: 8080,
    status: 'inactive',
    zone_id: 'zone_2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// 模拟路由数据
export const mockRoutes: MockRoute[] = [
  {
    id: 'route_1',
    name: 'Default Route',
    destination: '0.0.0.0/0',
    gateway: '192.168.1.1',
    status: 'active',
    zone_id: 'zone_1',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'route_2',
    name: 'Local Network',
    destination: '192.168.0.0/16',
    gateway: '192.168.1.1',
    status: 'active',
    zone_id: 'zone_1',
    created_at: '2024-01-01T00:00:00Z'
  }
]

// 模拟仪表板数据
export const mockDashboardData = {
  stats: {
    totalNodes: mockNodes.length,
    activeNodes: mockNodes.filter(n => n.status === 'active').length,
    totalRoutes: mockRoutes.length,
    activeRoutes: mockRoutes.filter(r => r.status === 'active').length,
    totalZones: mockZones.length,
    activeZones: mockZones.filter(z => z.is_active).length
  },
  recentActivity: [
    {
      id: '1',
      type: 'node_status',
      message: 'Node AP-Gateway-01 came online',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'route_added',
      message: 'New route added to zone Asia Pacific',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'user_login',
      message: 'User Jane Smith logged in',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ]
}

// 模拟API延迟
export const mockDelay = (ms: number = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms))
} 