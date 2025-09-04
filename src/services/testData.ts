// 测试IP池数据 - 用于开发和调试
export const testIPPoolsData = {
  success: true,
  data: {
    ippools: [
      {
        id: 'pool_1',
        name: '测试IP池1',
        network: '192.168.1.0/24',
        ip_range: {
          start: '192.168.1.1',
          end: '192.168.1.254'
        },
        zone_id: 'zone_1',
        total_ips: 254,
        used_ips: 150,
        available_ips: 104,
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'pool_2',
        name: '测试IP池2',
        network: '10.0.0.0/16',
        ip_range: {
          start: '10.0.0.1',
          end: '10.0.255.254'
        },
        zone_id: 'zone_1',
        total_ips: 65534,
        used_ips: 30000,
        available_ips: 35534,
        status: 'active',
        created_at: '2024-01-02T00:00:00Z',
        updated_at: '2024-01-02T00:00:00Z'
      },
      {
        id: 'pool_3',
        name: '测试IP池3',
        network: '172.16.0.0/12',
        ip_range: {
          start: '172.16.0.1',
          end: '172.31.255.254'
        },
        zone_id: 'zone_2',
        total_ips: 1048574,
        used_ips: 500000,
        available_ips: 548574,
        status: 'active',
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z'
      }
    ]
  }
}

export const testIPPoolsStatistics = {
  success: true,
  data: {
    total_pools: 3,
    allocated_pools: 3,
    available_pools: 0,
    total_ips: 1114362,
    allocated_ips: 530150,
    free_ips: 584212,
    available_ips: 584212,
    active_ips: 530150,
    user_quota: 1000000,
    usage_percentage: 47.6,
    zone_id: null,
    user_id: null
  }
}
