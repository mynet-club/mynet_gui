import { ref, computed } from 'vue'
import { socialService } from '../services/social/socialService'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import type { 
  Friend, 
  FriendRequest, 
  Invitation, 
  SearchUser, 
  SocialOverview,
  SocialStats,
  SocialDataResponse
} from '../types'

export function useSocial() {
  const { t } = useI18n()
  const notify = useNotify()

  // 响应式状态
  const loading = ref(false)
  const overview = ref<SocialOverview>({
    friend_count: 0,
    pending_requests: 0,
    connected_nodes: 0,
    active_routes: 0
  })
  
  const friends = ref<Friend[]>([])
  const friendRequests = ref<FriendRequest[]>([])
  const sentRequests = ref<FriendRequest[]>([])
  const invitations = ref<Invitation[]>([])
  const searchResults = ref<SearchUser[]>([])
  const searchLoading = ref(false)
  const currentRequestType = ref<'received' | 'sent'>('received')

  // 分页状态 
  const currentPage = ref(1)
  const perPage = ref(10)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // 计算属性
  const hasMoreFriends = computed(() => currentPage.value < totalPages.value)
  const onlineFriends = computed(() => friends.value.filter(f => f.status === 'online'))
  const offlineFriends = computed(() => friends.value.filter(f => f.status === 'offline'))
  const pendingInvitations = computed(() => invitations.value.filter(i => i.status === 'active'))
  const usedInvitations = computed(() => invitations.value.filter(i => i.status === 'used'))
  const expiredInvitations = computed(() => invitations.value.filter(i => i.status === 'expired'))
  
  // 根据当前请求类型返回相应的请求列表
  const currentRequests = computed(() => {
    return currentRequestType.value === 'received' ? friendRequests.value : sentRequests.value
  })

  // 获取社交概览数据
  const fetchOverview = async () => {
    try {
      loading.value = true
      const response = await socialService.getOverview()
      
      // 设置概览数据
      overview.value = {
        friend_count: response.stats?.friends_count || response.friends?.length || 0,
        pending_requests: response.stats?.pending_count || response.pending_requests?.length || 0,
        connected_nodes: response.stats?.connected_nodes || 0,
        active_routes: response.stats?.active_routes || 0
      }
      
      // 同时设置好友数据（避免额外的API调用）
      if (response.friends) {
        friends.value = response.friends
        // 模拟分页数据
        currentPage.value = 1
        totalPages.value = 1
        totalItems.value = response.friends.length
      }
      
      // 设置好友请求数据
      if (response.pending_requests) {
        friendRequests.value = response.pending_requests
      }
      
      // 设置发送的请求数据
      if (response.outgoing_requests) {
        sentRequests.value = response.outgoing_requests
      }
      
      // 设置邀请码数据
      if (response.invitations) {
        invitations.value = response.invitations
      }
    } catch (error) {
      console.error('获取社交概览失败:', error)
      notify.error(t('social.fetchOverviewError'))
    } finally {
      loading.value = false
    }
  }

  // 获取好友列表（现在主要用于搜索和分页）
  const fetchFriends = async (page = 1, search = '') => {
    try {
      loading.value = true
      
      if (search) {
        // 如果有搜索条件，从现有好友中过滤
        const filteredFriends = friends.value.filter(friend => 
          friend.name.toLowerCase().includes(search.toLowerCase())
        )
        friends.value = filteredFriends
        currentPage.value = 1
        totalPages.value = 1
        totalItems.value = filteredFriends.length
      } else {
        // 如果没有搜索条件，重新获取完整数据
        await fetchOverview()
      }
    } catch (error) {
      console.error('获取好友列表失败:', error)
      notify.error(t('social.fetchFriendsError'))
    } finally {
      loading.value = false
    }
  }

  // 搜索用户
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      searchResults.value = []
      return
    }
    
    try {
      searchLoading.value = true
      const response = await socialService.searchUsers(query)
      searchResults.value = response
    } catch (error) {
      console.error('搜索用户失败:', error)
      notify.error(t('social.searchUsersError'))
    } finally {
      searchLoading.value = false
    }
  }

  // 获取好友请求（现在从已缓存的数据中获取）
  const fetchFriendRequests = async (type: 'received' | 'sent' = 'received') => {
    try {
      loading.value = true
      currentRequestType.value = type
      
      // 如果还没有数据，先获取overview数据
      if (friendRequests.value.length === 0 && sentRequests.value.length === 0) {
        await fetchOverview()
      }
      
      // 数据已经通过 fetchOverview 设置，currentRequests 计算属性会自动返回正确的数据
      
    } catch (error) {
      console.error('获取好友请求失败:', error)
      notify.error(t('social.fetchRequestsError'))
    } finally {
      loading.value = false
    }
  }

  // 处理好友请求类型变化
  const handleRequestTypeChange = (type: 'received' | 'sent') => {
    currentRequestType.value = type
    fetchFriendRequests(type)
  }

  // 发送好友请求
  const sendFriendRequest = async (targetId: string, message?: string) => {
    try {
      loading.value = true
      const response = await socialService.sendFriendRequest(targetId, message)
      if (response.success) {
        notify.success(t('social.friendRequestSent'))
        // 更新搜索结果中的状态
        const userIndex = searchResults.value.findIndex(u => u.id === targetId)
        if (userIndex !== -1 && searchResults.value[userIndex]) {
          searchResults.value[userIndex].has_pending_request = true
        }
      } else {
        notify.error(response.message || t('social.friendRequestError'))
      }
    } catch (error) {
      console.error('发送好友请求失败:', error)
      notify.error(t('social.friendRequestError'))
    } finally {
      loading.value = false
    }
  }

  // 接受好友请求
  const acceptFriendRequest = async (requestId: string) => {
    try {
      loading.value = true
      const response = await socialService.acceptFriendRequest(requestId)
      if (response.success) {
        notify.success(t('social.friendRequestAccepted'))
        // 从请求列表中移除
        friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
        // 刷新好友列表和概览
        await fetchOverview()
      } else {
        notify.error(response.message || t('social.friendRequestAcceptError'))
      }
    } catch (error) {
      console.error('接受好友请求失败:', error)
      notify.error(t('social.friendRequestAcceptError'))
    } finally {
      loading.value = false
    }
  }

  // 拒绝好友请求
  const rejectFriendRequest = async (requestId: string) => {
    try {
      loading.value = true
      const response = await socialService.rejectFriendRequest(requestId)
      if (response.success) {
        notify.success(t('social.friendRequestRejected'))
        // 从请求列表中移除
        friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
        // 刷新概览
        await fetchOverview()
      } else {
        notify.error(response.message || t('social.friendRequestRejectError'))
      }
    } catch (error) {
      console.error('拒绝好友请求失败:', error)
      notify.error(t('social.friendRequestRejectError'))
    } finally {
      loading.value = false
    }
  }

  // 删除好友
  const removeFriend = async (friendId: string, friendName: string) => {
    try {
      loading.value = true
      const response = await socialService.removeFriend(friendId)
      if (response.success) {
        notify.success(t('social.friendRemoved', { name: friendName }))
        // 从好友列表中移除
        friends.value = friends.value.filter(f => f.id !== friendId)
        // 刷新概览
        await fetchOverview()
      } else {
        notify.error(response.message || t('social.friendRemoveError'))
      }
    } catch (error) {
      console.error('删除好友失败:', error)
      notify.error(t('social.friendRemoveError'))
    } finally {
      loading.value = false
    }
  }

  // 获取邀请码列表（现在从已缓存的数据中获取）
  const fetchInvitations = async () => {
    try {
      loading.value = true
      
      // 如果还没有数据，先获取overview数据
      if (invitations.value.length === 0) {
        await fetchOverview()
      }
      
      // 数据已经通过 fetchOverview 设置，无需额外处理
      
    } catch (error) {
      console.error('获取邀请码列表失败:', error)
      notify.error(t('social.fetchInvitationsError'))
    } finally {
      loading.value = false
    }
  }

  // 创建邀请码
  const createInvitation = async (expiresIn = 7) => {
    try {
      loading.value = true
      const response = await socialService.createInvitation(expiresIn)
      if (response) {
        notify.success(t('social.invitationCreated'))
        invitations.value.unshift(response)
      }
    } catch (error) {
      console.error('创建邀请码失败:', error)
      notify.error(t('social.invitationCreateError'))
    } finally {
      loading.value = false
    }
  }

  // 获取好友的节点
  const getFriendNodes = async (friendId: string) => {
    try {
      const response = await socialService.getFriendNodes(friendId)
      return response
    } catch (error) {
      console.error('获取好友节点失败:', error)
      notify.error(t('social.fetchFriendNodesError'))
      return []
    }
  }

  // 初始化数据
  const init = async () => {
    // 只需要调用 fetchOverview，它会获取所有必要的数据
    await fetchOverview()
  }

  return {
    // 状态
    loading,
    overview,
    friends,
    friendRequests: currentRequests, // 使用计算属性返回当前类型的请求
    invitations,
    searchResults,
    searchLoading,
    currentPage,
    perPage,
    totalPages,
    totalItems,
    currentRequestType,
    
    // 计算属性
    hasMoreFriends,
    onlineFriends,
    offlineFriends,
    pendingInvitations,
    usedInvitations,
    expiredInvitations,
    
    // 方法
    fetchOverview,
    fetchFriends,
    searchUsers,
    fetchFriendRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    fetchInvitations,
    createInvitation,
    getFriendNodes,
    handleRequestTypeChange,
    init
  }
}
