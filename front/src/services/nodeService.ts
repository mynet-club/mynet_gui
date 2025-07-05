import { api } from './api'

export const nodeService = {
  async getNodes() {
    const response = await api.get('/nodes')
    return response.data
  },
  
  async createNode(nodeData: any) {
    const response = await api.post('/nodes', nodeData)
    return response.data
  },
  
  async updateNode(id: string, nodeData: any) {
    const response = await api.put(`/nodes/${id}`, nodeData)
    return response.data
  },
  
  async deleteNode(id: string) {
    const response = await api.delete(`/nodes/${id}`)
    return response.data
  }
}