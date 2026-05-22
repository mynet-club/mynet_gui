<template>
  <q-page class="help-page">
    <div class="row q-gutter-md full-height">
      <!-- 左侧导航栏 -->
      <div class="col-3 help-sidebar">
        <q-card class="full-height">
          <q-card-section class="q-pb-none">
            <div class="text-h6 q-mb-md">
              <q-icon name="help" class="q-mr-sm" />
              帮助文档
            </div>
            
            <!-- 搜索框 -->
            <q-input
              v-model="searchQuery"
              placeholder="搜索帮助内容..."
              outlined
              dense
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append v-if="searchQuery">
                <q-icon 
                  name="clear" 
                  class="cursor-pointer" 
                  @click="clearSearch"
                />
              </template>
            </q-input>
          </q-card-section>
          
          <q-separator />
          
          <!-- 导航树 -->
          <q-card-section class="q-pt-sm help-navigation">
            <q-tree
              :nodes="filteredNavigation"
              node-key="id"
              v-model:selected="selectedNode"
              @update:selected="onNodeSelect"
              default-expand-all
              :filter="searchQuery"
            >
              <template v-slot:default-header="prop">
                <div class="row items-center">
                  <q-icon
                    :name="prop.node.icon || 'description'"
                    class="q-mr-sm"
                    :color="prop.node.children ? 'primary' : 'grey-6'"
                  />
                  <span>{{ prop.node.title }}</span>
                </div>
              </template>
            </q-tree>
          </q-card-section>
        </q-card>
      </div>
      
      <!-- 右侧内容区域 -->
      <div class="col-9 help-content">
        <q-card class="full-height">
          <!-- 面包屑导航 -->
          <q-card-section class="q-pb-sm" v-if="breadcrumbs.length > 0">
            <q-breadcrumbs>
              <q-breadcrumbs-el
                v-for="(crumb, index) in breadcrumbs"
                :key="index"
                :label="crumb.title"
                :icon="index === 0 ? 'home' : undefined"
                @click="navigateToBreadcrumb(crumb)"
                class="cursor-pointer"
              />
            </q-breadcrumbs>
          </q-card-section>
          
          <q-separator v-if="breadcrumbs.length > 0" />
          
          <!-- 内容展示 -->
          <q-card-section class="help-content-body">
            <div v-if="loading" class="text-center q-pa-xl">
              <q-spinner size="40px" />
              <div class="q-mt-md text-grey-6">加载中...</div>
            </div>
            
            <div v-else-if="error" class="text-center q-pa-xl">
              <q-icon name="error" size="48px" color="negative" />
              <div class="q-mt-md text-negative">{{ error }}</div>
              <q-btn
                flat
                color="primary"
                label="重试"
                @click="loadContent"
                class="q-mt-md"
              />
            </div>
            
            <div v-else-if="!selectedContent" class="text-center q-pa-xl">
              <q-icon name="help_outline" size="64px" color="grey-5" />
              <div class="q-mt-md text-h6 text-grey-6">欢迎使用 MyNet 帮助文档</div>
              <div class="q-mt-sm text-body2 text-grey-6">
                请从左侧导航选择要查看的内容
              </div>
            </div>
            
            <div v-else class="markdown-content" v-html="renderedContent"></div>
          </q-card-section>
          
          <!-- 底部操作栏 -->
          <q-card-actions v-if="selectedContent" align="right" class="q-pt-none">
            <q-btn
              flat
              icon="print"
              label="打印"
              @click="printContent"
              color="grey-7"
            />
            <q-btn
              flat
              icon="share"
              label="分享"
              @click="shareContent"
              color="grey-7"
            />
            <q-btn
              flat
              icon="feedback"
              label="反馈"
              @click="provideFeedback"
              color="primary"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>
    
    <!-- 回到顶部按钮 -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        fab
        icon="keyboard_arrow_up"
        color="primary"
        @click="scrollToTop"
        v-if="showBackToTop"
      />
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import debug from 'src/utils/debug'
import { useQuasar } from 'quasar'
import { marked } from 'marked'

const $q = useQuasar()

// 响应式数据
const searchQuery = ref('')
const selectedNode = ref<string | null>(null)
const selectedContent = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showBackToTop = ref(false)

// 帮助文档配置
const helpConfig = ref({
  version: '1.0.0',
  title: 'MyNet 帮助文档',
  description: 'MyNet 网络管理系统用户帮助文档',
  lastUpdated: '2025-09-15',
  navigation: [
    {
      id: 'overview',
      title: '系统概述',
      icon: 'info',
      children: [
        {
          id: 'what-is-mynet',
          title: '什么是 MyNet',
          file: 'overview/what-is-mynet.md'
        },
        {
          id: 'basic-concepts',
          title: '基本概念',
          file: 'overview/basic-concepts.md'
        }
      ]
    },
    {
      id: 'getting-started',
      title: '快速入门',
      icon: 'rocket_launch',
      children: [
        {
          id: 'registration',
          title: '用户注册',
          file: 'getting-started/registration.md'
        },
        {
          id: 'login',
          title: '登录系统',
          file: 'getting-started/login.md'
        }
      ]
    },
    {
      id: 'user-guide',
      title: '用户指南',
      icon: 'book',
      children: [
        {
          id: 'ip-pools',
          title: 'IP 池管理',
          children: [
            {
              id: 'create-ip-pool',
              title: '创建 IP 池',
              file: 'user-guide/ip-pools/create-ip-pool.md'
            }
          ]
        }
      ]
    },
    {
      id: 'faq',
      title: '常见问题',
      icon: 'help',
      children: [
        {
          id: 'general-faq',
          title: '一般问题',
          file: 'faq/general-faq.md'
        }
      ]
    }
  ],
  searchConfig: {
    enabled: true,
    placeholder: '搜索帮助内容...',
    highlightResults: true,
    maxResults: 10
  },
  features: {
    breadcrumb: true,
    backToTop: true,
    printPage: true,
    shareLink: true,
    feedback: true
  }
})

// 在组件挂载时加载配置
onMounted(async () => {
  try {
    // 尝试从服务器加载配置
    const response = await fetch('/docs/help/index.json')
    if (response.ok) {
      const config = await response.json()
      helpConfig.value = config
    }
  } catch (error) {
    debug.warn('Failed to load help config, using default:', error)
    // 使用默认配置
  }
  
  window.addEventListener('scroll', handleScroll)
  
  // 如果 URL 中有特定的帮助页面 ID，自动跳转
  const urlParams = new URLSearchParams(window.location.search)
  const helpId = urlParams.get('id')
  if (helpId) {
    selectedNode.value = helpId
  }
})

// 计算属性
const filteredNavigation = computed(() => {
  if (!searchQuery.value) {
    return helpConfig.value.navigation
  }
  
  // 简单的搜索过滤逻辑
  const query = searchQuery.value.toLowerCase()
  return filterNodes(helpConfig.value.navigation, query)
})

const breadcrumbs = computed(() => {
  if (!selectedNode.value) return []
  
  const path = findNodePath(helpConfig.value.navigation, selectedNode.value)
  return path || []
})

const renderedContent = computed(() => {
  if (!selectedContent.value) return ''
  return marked(selectedContent.value)
})

// 方法
const filterNodes = (nodes: any[], query: string): any[] => {
  return nodes.reduce((filtered: any[], node: any) => {
    const matches = node.title.toLowerCase().includes(query)
    const children = node.children ? filterNodes(node.children, query) : []
    
    if (matches || children.length > 0) {
      filtered.push({
        ...node,
        children: children.length > 0 ? children : node.children
      })
    }
    
    return filtered
  }, [])
}

const findNodePath = (nodes: any[], targetId: string, path: any[] = []): any[] | null => {
  for (const node of nodes) {
    const currentPath = [...path, { id: node.id, title: node.title }]
    
    if (node.id === targetId) {
      return currentPath
    }
    
    if (node.children) {
      const result = findNodePath(node.children, targetId, currentPath)
      if (result) return result
    }
  }
  
  return null
}

const findNodeById = (nodes: any[], id: string): any | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

const onNodeSelect = (nodeId: string) => {
  const node = findNodeById(helpConfig.value.navigation, nodeId)
  if (node?.file) {
    loadContent(node.file)
  } else {
    selectedContent.value = null
  }
}

const loadContent = async (filePath?: string) => {
  if (!filePath && selectedNode.value) {
    const node = findNodeById(helpConfig.value.navigation, selectedNode.value)
    filePath = node?.file
  }
  
  if (!filePath) return
  
  loading.value = true
  error.value = null
  
  try {
    // 尝试从构建后的文档目录加载
    let response = await fetch(`/docs/help/${filePath}`)
    
    if (!response.ok) {
      // 如果构建版本不存在，尝试开发版本路径
      response = await fetch(`/src/docs/help/${filePath}`)
    }
    
    if (response.ok) {
      selectedContent.value = await response.text()
    } else {
      // 如果文件不存在，显示占位内容
      selectedContent.value = generatePlaceholderContent(filePath)
    }
  } catch (err) {
    debug.warn('Failed to load help content:', err)
    selectedContent.value = generatePlaceholderContent(filePath)
  } finally {
    loading.value = false
  }
}

const generatePlaceholderContent = (filePath: string) => {
  const fileName = filePath.split('/').pop()?.replace('.md', '') || ''
  const title = fileName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
  
  return `# ${title}

此部分内容正在编写中...

## 即将包含的内容

- 详细的操作步骤
- 图文并茂的说明
- 实用的技巧和建议
- 常见问题解答

请关注后续更新。如有疑问，请通过反馈功能联系我们。`
}

const clearSearch = () => {
  searchQuery.value = ''
}

const navigateToBreadcrumb = (crumb: any) => {
  selectedNode.value = crumb.id
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const printContent = () => {
  window.print()
}

const shareContent = () => {
  if (navigator.share) {
    navigator.share({
      title: 'MyNet 帮助文档',
      url: window.location.href
    })
  } else {
    navigator.clipboard.writeText(window.location.href)
    $q.notify({
      message: '链接已复制到剪贴板',
      type: 'positive',
      timeout: 2000
    })
  }
}

const provideFeedback = () => {
  $q.dialog({
    title: '提供反馈',
    message: '请告诉我们您对这部分帮助内容的建议：',
    prompt: {
      model: '',
      type: 'textarea'
    },
    cancel: true,
    persistent: true
  }).onOk(feedback => {
    // 在实际应用中，这里应该发送反馈到服务器
    debug.log('用户反馈:', feedback)
    $q.notify({
      message: '谢谢您的反馈！我们会认真考虑您的建议。',
      type: 'positive',
      timeout: 3000
    })
  })
}

// 监听滚动，控制回到顶部按钮显示
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// 生命周期
// onMounted 逻辑已经移到上面的 helpConfig 定义后面

// 监听选中节点变化，更新 URL
watch(selectedNode, (newId) => {
  if (newId) {
    const url = new URL(window.location.href)
    url.searchParams.set('id', newId)
    window.history.replaceState({}, '', url.toString())
  }
})
</script>

<style lang="sass" scoped>
.help-page
  height: calc(100vh - 50px)
  
.help-sidebar
  min-width: 300px
  max-width: 400px
  
.help-navigation
  max-height: calc(100vh - 200px)
  overflow-y: auto
  
.help-content-body
  max-height: calc(100vh - 150px)
  overflow-y: auto
  
.markdown-content
  :deep(h1)
    color: #1976D2
    border-bottom: 2px solid #1976D2
    padding-bottom: 0.5rem
    margin-bottom: 1rem
    
  :deep(h2)
    color: #26A69A
    margin-top: 2rem
    margin-bottom: 1rem
    
  :deep(h3)
    margin-top: 1.5rem
    margin-bottom: 0.5rem
    
  :deep(code)
    background-color: #FAFAFA
    padding: 0.2rem 0.4rem
    border-radius: 4px
    font-family: 'Courier New', monospace
    
  :deep(pre)
    background-color: #FAFAFA
    padding: 1rem
    border-radius: 8px
    overflow-x: auto
    
  :deep(blockquote)
    border-left: 4px solid #1976D2
    margin-left: 0
    padding-left: 1rem
    color: #616161
    
  :deep(table)
    width: 100%
    border-collapse: collapse
    margin: 1rem 0
    
  :deep(th, td)
    border: 1px solid #E0E0E0
    padding: 0.5rem
    text-align: left
    
  :deep(th)
    background-color: #FAFAFA
    font-weight: 600
    
  :deep(img)
    max-width: 100%
    height: auto
    border-radius: 8px
    box-shadow: 0 2px 8px rgba(0,0,0,0.1)
    
  :deep(a)
    color: #1976D2
    text-decoration: none
    
    &:hover
      text-decoration: underline
</style>
