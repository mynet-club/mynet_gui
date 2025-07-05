import { ref, computed } from 'vue'
import { apiService } from '../services/api'
import { useNotify } from './useNotify'
import { useI18n } from 'vue-i18n'
import type { 
  Friend, 
  FriendRequest, 
  Invitation, 
  SearchUser, 
  SocialOverview,
  SocialStats
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
  const invitations = ref<Invitation[]>([])
  const searchResults = ref<SearchUser[]>([])
  const searchLoading = ref(false)

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

  // 获取社交概览数据
  const fetchOverview = async () => {
    try {
      loading.value = true
      const response = await apiService.social.getOverview()
      overview.value = response.data
    } catch (error) {
      console.error('获取社交概览失败:', error)
      notify.error(t('social.fetchOverviewError'))
    } finally {
      loading.value = false
    }
  }

  // 获取好友列表
  const fetchFriends = async (page = 1, search = '') => {
    try {
      loading.value = true
      const response = await apiService.social.getFriends({
        page,
        per_page: perPage.value,
        search
      })
      friends.value = response.data
      currentPage.value = response.meta.current_page
      totalPages.value = response.meta.last_page
      totalItems.value = response.meta.total
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
      const response = await apiService.social.searchUsers(query)
      searchResults.value = response.data
    } catch (error) {
      console.error('搜索用户失败:', error)
      notify.error(t('social.searchUsersError'))
    } finally {
      searchLoading.value = false
    }
  }

  // 获取好友请求
  const fetchFriendRequests = async (type: 'received' | 'sent' = 'received') => {
    try {
      loading.value = true
      const response = await apiService.social.getFriendRequests(type)
      friendRequests.value = response.data
    } catch (error) {
      console.error('获取好友请求失败:', error)
      notify.error(t('social.fetchRequestsError'))
    } finally {
      loading.value = false
    }
  }

  // 处理好友请求类型变化
  const handleRequestTypeChange = (type: 'received' | 'sent') => {
    fetchFriendRequests(type)
  }

  // 发送好友请求
  const sendFriendRequest = async (targetId: string, message?: string) => {
    try {
      loading.value = true
      const response = await apiService.social.sendFriendRequest(targetId, message)
      if (response.success) {
        notify.success(t('social.friendRequestSent'))
        // 更新搜索结果中的状态
        const userIndex = searchResults.value.findIndex(u => u.id === targetId)
        if (userIndex !== -1) {
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
      const response = await apiService.social.acceptFriendRequest(requestId)
      if (response.success) {
        notify.success(t('social.friendRequestAccepted'))
        // 从请求列表中移除
        friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
        // 刷新好友列表和概览
        await Promise.all([fetchFriends(), fetchOverview()])
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
      const response = await apiService.social.rejectFriendRequest(requestId)
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
      const response = await apiService.social.removeFriend(friendId)
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

  // 获取邀请码列表
  const fetchInvitations = async () => {
    try {
      loading.value = true
      const response = await apiService.social.getInvitations()
      invitations.value = response.data
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
      const response = await apiService.social.createInvitation(expiresIn)
      if (response.data) {
        notify.success(t('social.invitationCreated'))
        invitations.value.unshift(response.data)
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
      const response = await apiService.social.getFriendNodes(friendId)
      return response.data
    } catch (error) {
      console.error('获取好友节点失败:', error)
      notify.error(t('social.fetchFriendNodesError'))
      return []
    }
  }

  // 初始化数据
  const init = async () => {
    await fetchOverview()
    await fetchFriends()
    await fetchFriendRequests()
    await fetchInvitations()
  }

  return {
    // 状态
    loading,
    overview,
    friends,
    friendRequests,
    invitations,
    searchResults,
    searchLoading,
    currentPage,
    perPage,
    totalPages,
    totalItems,
    
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
