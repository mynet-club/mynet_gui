<template>
  <q-avatar 
    :size="size" 
    :class="avatarClass"
    v-bind="$attrs"
  >
    <img 
      :src="currentAvatarUrl" 
      @error="handleError"
      :alt="alt"
    />
    <!-- 加载状态 -->
    <q-inner-loading :showing="loading" color="primary" />
    
    <!-- 可选的编辑按钮 -->
    <q-btn
      v-if="editable"
      fab
      mini
      icon="camera_alt"
      color="primary"
      class="absolute-bottom-right"
      style="transform: translate(25%, 25%)"
      @click="$emit('edit')"
      :loading="uploading"
    >
      <q-tooltip>更改头像</q-tooltip>
    </q-btn>
  </q-avatar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import debug from "../../utils/debug"
import { useAvatar } from '../../composables/useAvatar'

interface Props {
  userId?: string | number
  size?: string
  editable?: boolean
  uploading?: boolean
  alt?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: '64px',
  editable: false,
  uploading: false,
  alt: 'User Avatar',
  class: ''
})

const emit = defineEmits<{
  edit: []
  error: [error: Error]
}>()

const { getAvatarUrl, defaultAvatar, loading } = useAvatar()
const currentAvatarUrl = ref<string>(defaultAvatar)
const hasError = ref(false)

const avatarClass = computed(() => {
  const classes = [props.class]
  if (hasError.value) {
    classes.push('avatar-error')
  }
  return classes.join(' ')
})

// 加载头像
const loadAvatar = async () => {
  hasError.value = false
  debug.log('🔧 [UserAvatar] Loading avatar for userId:', props.userId)
  
  try {
    // 如果有userId就传递，否则获取当前用户头像
    currentAvatarUrl.value = await getAvatarUrl(props.userId)
    debug.log('🔧 [UserAvatar] Avatar loaded successfully:', currentAvatarUrl.value.substring(0, 50) + '...')
  } catch (error) {
    debug.error('🔧 [UserAvatar] Failed to load avatar:', error)
    currentAvatarUrl.value = defaultAvatar
    hasError.value = true
  }
}

// 处理图片加载错误
const handleError = () => {
  if (currentAvatarUrl.value !== defaultAvatar) {
    debug.log('Avatar image failed to load, using default')
    currentAvatarUrl.value = defaultAvatar
    hasError.value = true
  }
}

// 监听userId变化
watch(() => props.userId, () => {
  loadAvatar()
}, { immediate: true })

// 暴露刷新方法
const refresh = () => {
  loadAvatar()
}

// 不需要 onMounted，因为 watch 已经有 immediate: true

defineExpose({
  refresh,
  loadAvatar
})
</script>

<style scoped>
.avatar-error {
  opacity: 0.7;
}

.q-avatar {
  position: relative;
}
</style>
