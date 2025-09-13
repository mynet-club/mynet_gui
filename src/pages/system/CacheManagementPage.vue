<template>
  <q-page class="q-pa-md">
    <div class="row q-gutter-md">
      <!-- 缓存状态卡片 -->
      <div class="col-md-4 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">缓存状态</div>
            
            <div class="q-mb-sm">
              <q-chip 
                :color="isEnabled ? 'positive' : 'negative'" 
                text-color="white"
                :icon="isEnabled ? 'check_circle' : 'cancel'"
              >
                {{ isEnabled ? '已启用' : '已禁用' }}
              </q-chip>
            </div>

            <q-separator class="q-my-md" />

            <div class="q-mb-sm">
              <div class="text-subtitle2">内存缓存</div>
              <div class="text-body2">
                条目数: {{ stats.memory.count }}
              </div>
              <div class="text-body2">
                大小: {{ formattedMemorySize }}
              </div>
            </div>

            <div class="q-mb-sm">
              <div class="text-subtitle2">本地存储缓存</div>
              <div class="text-body2">
                条目数: {{ stats.localStorage.count }}
              </div>
            </div>

            <div class="q-mb-sm">
              <div class="text-subtitle2">会话存储缓存</div>
              <div class="text-body2">
                条目数: {{ stats.sessionStorage.count }}
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 缓存操作卡片 -->
      <div class="col-md-4 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">缓存操作</div>
            
            <div class="q-gutter-sm">
              <q-btn
                color="primary"
                icon="refresh"
                label="刷新统计"
                @click="updateStats"
                class="full-width"
              />
              
              <q-btn
                :color="isEnabled ? 'negative' : 'positive'"
                :icon="isEnabled ? 'toggle_off' : 'toggle_on'"
                :label="isEnabled ? '禁用缓存' : '启用缓存'"
                @click="toggleCache"
                class="full-width"
              />
              
              <q-btn
                color="warning"
                icon="clear_all"
                label="清除内存缓存"
                @click="clearMemoryCache"
                class="full-width"
              />
              
              <q-btn
                color="orange"
                icon="storage"
                label="清除存储缓存"
                @click="clearStorageCache"
                class="full-width"
              />
              
              <q-btn
                color="negative"
                icon="delete_forever"
                label="清除所有缓存"
                @click="confirmClearAll"
                class="full-width"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 缓存策略说明 -->
      <div class="col-md-4 col-xs-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">缓存策略</div>
            
            <q-list dense>
              <q-item>
                <q-item-section avatar>
                  <q-icon color="positive" name="memory" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>内存缓存</q-item-label>
                  <q-item-label caption>
                    快速访问，页面刷新后失效
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon color="info" name="storage" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>本地存储</q-item-label>
                  <q-item-label caption>
                    持久化存储，用户手动清除才失效
                  </q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item>
                <q-item-section avatar>
                  <q-icon color="warning" name="schedule" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>会话存储</q-item-label>
                  <q-item-label caption>
                    标签页关闭后自动清除
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- 缓存详细信息 -->
    <div class="row q-gutter-md q-mt-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">缓存配置建议</div>
            
            <q-list>
              <q-expansion-item
                icon="api"
                label="API 缓存策略"
                default-opened
              >
                <q-card>
                  <q-card-section>
                    <div class="text-body1 q-mb-md">根据数据特性配置不同的缓存策略：</div>
                    
                    <q-markup-table>
                      <thead>
                        <tr>
                          <th class="text-left">数据类型</th>
                          <th class="text-left">建议TTL</th>
                          <th class="text-left">存储方式</th>
                          <th class="text-left">说明</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>用户信息</td>
                          <td>10分钟</td>
                          <td>localStorage</td>
                          <td>相对稳定，持久化存储</td>
                        </tr>
                        <tr>
                          <td>公共服务列表</td>
                          <td>5分钟</td>
                          <td>memory</td>
                          <td>变化较少，内存缓存即可</td>
                        </tr>
                        <tr>
                          <td>好友服务</td>
                          <td>1分钟</td>
                          <td>memory</td>
                          <td>实时性要求高</td>
                        </tr>
                        <tr>
                          <td>我的服务</td>
                          <td>30秒</td>
                          <td>memory</td>
                          <td>需要实时更新</td>
                        </tr>
                        <tr>
                          <td>系统配置</td>
                          <td>30分钟</td>
                          <td>localStorage</td>
                          <td>很少变化，长期缓存</td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
              
              <q-expansion-item
                icon="settings"
                label="性能优化建议"
              >
                <q-card>
                  <q-card-section>
                    <q-list>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon color="positive" name="speed" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>启用预取</q-item-label>
                          <q-item-label caption>
                            预取用户可能访问的数据，提升响应速度
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item>
                        <q-item-section avatar>
                          <q-icon color="info" name="update" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>智能失效</q-item-label>
                          <q-item-label caption>
                            数据变更时自动清除相关缓存
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item>
                        <q-item-section avatar>
                          <q-icon color="warning" name="memory" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>内存管理</q-item-label>
                          <q-item-label caption>
                            定期清理过期缓存，避免内存泄漏
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
import { useCacheStatus } from '../../composables/useCache'

const $q = useQuasar()

const {
  stats,
  isEnabled,
  formattedMemorySize,
  updateStats,
  toggleCache,
  clearAllCache,
  clearMemoryCache,
  clearStorageCache
} = useCacheStatus()

const confirmClearAll = () => {
  $q.dialog({
    title: '确认清除',
    message: '确定要清除所有缓存吗？这将影响应用性能，直到缓存重新建立。',
    cancel: true,
    persistent: true
  }).onOk(() => {
    clearAllCache()
    $q.notify({
      type: 'positive',
      message: '所有缓存已清除',
      timeout: 2000
    })
  })
}
</script>
