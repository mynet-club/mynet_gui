/**
 * 将引导进度与实际用户操作挂钩
 * 
 * 用法：在页面操作成功后调用对应方法，自动推进引导阶段
 */

import { useOnboardingStore } from '../stores/onboarding'
import { OnboardingStage } from '../types/tips'

export function useOnboardingActions() {
  const onboardingStore = useOnboardingStore()

  /** IP 池创建成功后调用 */
  const onIpPoolCreated = () => {
    if (!onboardingStore.stages.first_ippool_created) {
      onboardingStore.completeStage(OnboardingStage.CreateIPPool)
    }
  }

  /** 节点（设备）创建成功后调用 */
  const onNodeCreated = () => {
    if (!onboardingStore.stages.first_device_added) {
      onboardingStore.completeStage(OnboardingStage.AddFirstDevice)
    } else if (!onboardingStore.stages.second_device_added) {
      onboardingStore.completeStage(OnboardingStage.AddSecondDevice)
    }
  }

  /** 好友请求被接受后调用 */
  const onFriendAdded = () => {
    if (!onboardingStore.stages.inviter_friend_added) {
      onboardingStore.completeStage(OnboardingStage.AddInviterFriend)
    }
  }

  /** 查看了邀请人设备后调用 */
  const onInviterDevicesViewed = () => {
    if (!onboardingStore.stages.inviter_devices_viewed) {
      onboardingStore.completeStage(OnboardingStage.ViewInviterDevices)
    }
  }

  /** 跨用户连接建立后调用 */
  const onCrossUserConnectionEstablished = () => {
    if (!onboardingStore.stages.cross_user_connection_established) {
      onboardingStore.completeStage(OnboardingStage.EstablishCrossUserConnection)
    }
  }

  /** 查看连接管理页面后调用 */
  const onConnectionManagementViewed = () => {
    if (!onboardingStore.stages.connection_management_shown) {
      onboardingStore.completeStage(OnboardingStage.ManageConnections)
    }
  }

  return {
    onIpPoolCreated,
    onNodeCreated,
    onFriendAdded,
    onInviterDevicesViewed,
    onCrossUserConnectionEstablished,
    onConnectionManagementViewed
  }
}
