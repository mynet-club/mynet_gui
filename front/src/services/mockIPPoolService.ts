import type { IPPool, IPPoolStatistics, IPAllocation } from '../types/ippool'

// 模拟IP池数据
const mockPools: IPPool[] = [
  {
    id: 'pool_001',
    zone_id: 'zone_1',
    name: 'Production Pool',
    network: '192.168.1.0/24',
    ip_range: {
      start: '192.168.1.1',
      end: '192.168.1.254'
    },
    status: 'available',
    total_ips: 254,
    used_ips: 45,
    available_ips: 209,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'pool_002',
    zone_id: 'zone_1',
    name: 'Development Pool',
    network: '10.0.0.0/24',
    ip_range: {
      start: '10.0.0.1',
      end: '10.0.0.100'
    },
    status: 'available',
    total_ips: 100,
    used_ips: 23,
    available_ips: 77,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: 'pool_003',
    zone_id: 'zone_2',
    name: 'Testing Pool',
    network: '172.16.0.0/24',
    ip_range: {
      start: '172.16.0.1',
      end: '172.16.0.50'
    },
    status: 'allocated',
    total_ips: 50,
    used_ips: 50,
    available_ips: 0,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  }
]

// 模拟统计数据
const mockStatistics: IPPoolStatistics = {
  total_pools: 3,
  allocated_pools: 1,
  available_pools: 2,
  total_ips: 404,
  allocated_ips: 118,
  available_ips: 286
}

// 模拟分配记录
const mockAllocations: { [poolId: string]: IPAllocation[] } = {
  'pool_001': [
    {
      id: 'alloc_001',
      pool_id: 'pool_001',
      ip_address: '192.168.1.10',
      node_id: 'node_001',
      node_name: 'Gateway-01',
      allocated_at: '2024-01-01T10:00:00Z',
      status: 'active'
    },
    {
      id: 'alloc_002',
      pool_id: 'pool_001',
      ip_address: '192.168.1.11',
      node_id: 'node_002',
      node_name: 'Server-01',
      allocated_at: '2024-01-01T11:00:00Z',
      status: 'active'
    }
  ],
  'pool_002': [
    {
      id: 'alloc_003',
      pool_id: 'pool_002',
      ip_address: '10.0.0.10',
      node_id: 'node_003',
      node_name: 'Dev-Server',
      allocated_at: '2024-01-02T10:00:00Z',
      status: 'active'
    }
  ]
}

export const mockIPPoolService = {
  // 获取IP池列表
  async getPools(zoneId?: string): Promise<{ ippools: IPPool[] }> {
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
    let pools = mockPools
    if (zoneId) {
      pools = mockPools.filter(pool => pool.zone_id === zoneId)
    }
    return { ippools: pools }
  },

  // 获取单个IP池
  async getPool(poolId: string): Promise<{ ippool: IPPool }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const pool = mockPools.find(p => p.id === poolId)
    if (!pool) {
      throw new Error('IP pool not found')
    }
    return { ippool: pool }
  },

  // 创建IP池
  async createPool(poolData: any): Promise<{ ippool: IPPool }> {
    await new Promise(resolve => setTimeout(resolve, 800))
    const newPool: IPPool = {
      id: `pool_${Date.now()}`,
      zone_id: poolData.zone_id,
      name: poolData.name,
      network: poolData.network,
      ip_range: poolData.ip_range,
      status: 'available',
      total_ips: this.calculateIPCount(poolData.ip_range.start, poolData.ip_range.end),
      used_ips: 0,
      available_ips: this.calculateIPCount(poolData.ip_range.start, poolData.ip_range.end),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockPools.push(newPool)
    return { ippool: newPool }
  },

  // 更新IP池
  async updatePool(poolId: string, poolData: any): Promise<{ ippool: IPPool }> {
    await new Promise(resolve => setTimeout(resolve, 600))
    const poolIndex = mockPools.findIndex(p => p.id === poolId)
    if (poolIndex === -1) {
      throw new Error('IP pool not found')
    }
    
    const updatedPool = {
      ...mockPools[poolIndex],
      ...poolData,
      updated_at: new Date().toISOString()
    }
    mockPools[poolIndex] = updatedPool
    return { ippool: updatedPool }
  },

  // 删除IP池
  async deletePool(poolId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    const poolIndex = mockPools.findIndex(p => p.id === poolId)
    if (poolIndex === -1) {
      throw new Error('IP pool not found')
    }
    mockPools.splice(poolIndex, 1)
  },

  // 分配IP
  async allocateIP(poolId: string, nodeId?: string): Promise<{ allocation: IPAllocation }> {
    await new Promise(resolve => setTimeout(resolve, 600))
    const pool = mockPools.find(p => p.id === poolId)
    if (!pool) {
      throw new Error('IP pool not found')
    }
    
    if (pool.available_ips === 0) {
      throw new Error('No available IPs in pool')
    }
    
    // 生成一个可用的IP地址
    const allocatedIP = this.generateNextIP(pool.ip_range.start, pool.used_ips || 0)
    
    const allocation: IPAllocation = {
      id: `alloc_${Date.now()}`,
      pool_id: poolId,
      ip_address: allocatedIP,
      node_id: nodeId,
      node_name: nodeId ? `Node-${nodeId}` : undefined,
      allocated_at: new Date().toISOString(),
      status: 'active'
    }
    
    // 更新IP池统计
    pool.used_ips = (pool.used_ips || 0) + 1
    pool.available_ips = (pool.available_ips || 0) - 1
    pool.updated_at = new Date().toISOString()
    
    // 添加到分配记录
    if (!mockAllocations[poolId]) {
      mockAllocations[poolId] = []
    }
    mockAllocations[poolId].push(allocation)
    
    return { allocation }
  },

  // 释放IP
  async releaseIP(poolId: string, ipAddress: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    const pool = mockPools.find(p => p.id === poolId)
    if (!pool) {
      throw new Error('IP pool not found')
    }
    
    const allocations = mockAllocations[poolId] || []
    const allocationIndex = allocations.findIndex(a => a.ip_address === ipAddress && a.status === 'active')
    
    if (allocationIndex === -1) {
      throw new Error('IP allocation not found')
    }
    
    // 标记为已释放
    const allocation = allocations[allocationIndex]
    if (allocation) {
      allocation.status = 'released'
    }
    
    // 更新IP池统计
    pool.used_ips = (pool.used_ips || 0) - 1
    pool.available_ips = (pool.available_ips || 0) + 1
    pool.updated_at = new Date().toISOString()
  },

  // 获取分配记录
  async getAllocations(poolId: string): Promise<{ allocations: IPAllocation[] }> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const allocations = mockAllocations[poolId] || []
    return { allocations: allocations.filter(a => a.status === 'active') }
  },

  // 获取统计信息
  async getStatistics(zoneId?: string): Promise<{ statistics: IPPoolStatistics }> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    let filteredPools = mockPools
    if (zoneId) {
      filteredPools = mockPools.filter(pool => pool.zone_id === zoneId)
    }
    
    const statistics: IPPoolStatistics = {
      total_pools: filteredPools.length,
      allocated_pools: filteredPools.filter(p => p.status === 'allocated').length,
      available_pools: filteredPools.filter(p => p.status === 'available').length,
      total_ips: filteredPools.reduce((sum, pool) => sum + (pool.total_ips || 0), 0),
      allocated_ips: filteredPools.reduce((sum, pool) => sum + (pool.used_ips || 0), 0),
      available_ips: filteredPools.reduce((sum, pool) => sum + (pool.available_ips || 0), 0)
    }
    
    return { statistics }
  },

  // 工具方法
  calculateIPCount(startIP: string, endIP: string): number {
    const start = this.ipToNumber(startIP)
    const end = this.ipToNumber(endIP)
    return end - start + 1
  },

  ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0)
  },

  generateNextIP(startIP: string, offset: number): string {
    const startNum = this.ipToNumber(startIP)
    const nextNum = startNum + offset
    return [
      (nextNum >>> 24) & 0xFF,
      (nextNum >>> 16) & 0xFF,
      (nextNum >>> 8) & 0xFF,
      nextNum & 0xFF
    ].join('.')
  }
}
