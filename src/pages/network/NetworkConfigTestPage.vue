<template>
  <div class="network-config-test-page q-pa-md">
    <div class="text-h5 q-mb-md">网络配置测试页面</div>
    
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">模拟节点数据</div>
        <div class="q-mt-sm">
          <q-btn-group>
            <q-btn 
              color="primary" 
              @click="setupGNBNode"
              :class="{ 'q-btn--selected': currentNode?.vpn_type === 'gnb' }"
            >
              GNB节点
            </q-btn>
            <q-btn 
              color="primary" 
              @click="setupWireguardNode"
              :class="{ 'q-btn--selected': currentNode?.vpn_type === 'wireguard' }"
            >
              WireGuard节点
            </q-btn>
            <q-btn 
              color="primary" 
              @click="setupOpenVPNNode"
              :class="{ 'q-btn--selected': currentNode?.vpn_type === 'openvpn' }"
            >
              OpenVPN节点
            </q-btn>
          </q-btn-group>
        </div>
        
        <div class="q-mt-md" v-if="currentNode">
          <div class="text-subtitle2">当前节点信息:</div>
          <div class="text-caption">ID: {{ currentNode.node_id }}</div>
          <div class="text-caption">名称: {{ currentNode.node_name }}</div>
          <div class="text-caption">VPN类型: {{ currentNode.vpn_type }}</div>
          <div class="text-caption">节点IP: {{ currentNode.node_ip }}</div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 网络配置组件 -->
    <div v-if="currentNode" class="network-config-container">
      <NetworkConfigPage />
    </div>
    
    <q-card v-else class="text-center q-py-lg">
      <q-card-section>
        <div class="text-h6 text-grey-6">请选择一个节点类型来测试网络配置</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import NetworkConfigPage from './node-edit/NetworkConfigPage.vue'
import type { Node } from '../../types/node'

// 模拟节点数据
const currentNode = ref<Node | null>(null)

// 创建模拟的节点数据
const setupGNBNode = () => {
  currentNode.value = {
    id: 1,
    node_id: 'N20240101001',
    node_name: '测试GNB节点',
    description: '这是一个测试GNB节点',
    status: 'active',
    vpn_type: 'gnb',
    node_ip: '10.0.0.1',
    ip_group_sequence_number: 1,
    public_ip: '203.0.113.1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    network_config: {
      ifname: 'gnb_tun',
      node_ip: '10.0.0.1',
      ip_group_sequence_number: 1,
      index_servers: ['203.0.113.100:8080'],
      lan_ips: ['192.168.1.100'],
      public_ips: ['203.0.113.1']
    }
  }
}

const setupWireguardNode = () => {
  currentNode.value = {
    id: 2,
    node_id: 'N20240101002',
    node_name: '测试WireGuard节点',
    description: '这是一个测试WireGuard节点',
    status: 'active',
    vpn_type: 'wireguard',
    node_ip: '10.0.0.2',
    ip_group_sequence_number: 2,
    public_ip: '203.0.113.2',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    network_config: {
      ifname: 'WG01',
      node_ip: '10.0.0.2',
      ip_group_sequence_number: 2,
      index_servers: ['203.0.113.100:8080', '203.0.113.101:8080'],
      lan_ips: ['192.168.2.100', '192.168.2.101'],
      public_ips: ['203.0.113.2', '2001:db8::2']
    }
  }
}

const setupOpenVPNNode = () => {
  currentNode.value = {
    id: 3,
    node_id: 'N20240101003',
    node_name: '测试OpenVPN节点',
    description: '这是一个测试OpenVPN节点',
    status: 'active',
    vpn_type: 'openvpn',
    node_ip: '10.0.0.3',
    ip_group_sequence_number: 3,
    public_ip: '203.0.113.3',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    network_config: {
      ifname: 'tun0',
      node_ip: '10.0.0.3',
      ip_group_sequence_number: 3,
      index_servers: ['203.0.113.100:8080'],
      lan_ips: ['192.168.3.100'],
      public_ips: ['203.0.113.3']
    }
  }
}

// 创建模拟的useNode组合式函数
const mockNodeData = {
  node: currentNode,
  loading: ref(false),
  saving: ref(false),
  loadNode: async (nodeId: string) => {
    console.log('模拟加载节点:', nodeId)
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    return currentNode.value
  },
  updateNode: async (nodeId: string, data: any) => {
    console.log('模拟更新节点:', nodeId, data)
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000))
    return currentNode.value
  }
}

// 提供给子组件使用
provide('nodeData', mockNodeData)

// 为了让NetworkConfigPage能够获取到route参数，我们需要模拟路由
const route = useRoute()
if (!route.params.id) {
  // 如果没有路由参数，设置一个默认值
  Object.defineProperty(route.params, 'id', {
    value: 'test-node-1',
    writable: true
  })
}
</script>

<style scoped>
.network-config-test-page {
  max-width: 1200px;
  margin: 0 auto;
}

.network-config-container {
  margin-top: 20px;
}

.q-btn--selected {
  background-color: var(--q-primary);
  color: white;
}
</style>
