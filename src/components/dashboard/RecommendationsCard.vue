<template>
  <q-card class="recommendations-card" bordered>
    <!-- 渐变背景头部 -->
    <div class="card-header-gradient">
      <q-card-section class="card-header">
        <div class="header-content">
          <div class="welcome-section">
            <div class="greeting">{{ welcomeMessage.greeting }}</div>
            <div class="encouragement">{{ welcomeMessage.encouragement }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="refresh"
            :loading="isAnalyzing"
            @click="refreshRecommendations"
            color="white"
          >
            <q-tooltip>刷新推荐</q-tooltip>
          </q-btn>
        </div>
        <div class="progress-tip">
          <q-icon name="timeline" size="18px" />
          <span>{{ progressTip }}</span>
        </div>
      </q-card-section>
    </div>

    <q-card-section class="recommendations-list">
      <div class="section-title">
        <q-icon name="lightbulb" />
        <span>智能推荐</span>
      </div>

      <div v-if="topRecommendations.length === 0" class="no-recommendations">
        <q-icon name="check_circle" size="48px" color="positive" />
        <div class="message">太棒了！你已经完成了所有主要配置</div>
        <div class="sub-message">继续探索 MyNet 的各项功能吧</div>
      </div>

      <div v-else class="action-cards">
        <div
          v-for="action in topRecommendations"
          :key="action.id"
          class="action-card"
          :class="`category-${action.category}`"
          @click="handleAction(action)"
        >
          <div class="action-icon-wrapper">
            <q-icon :name="action.icon" size="28px" class="action-icon" />
          </div>
          
          <div class="action-info">
            <div class="action-title">{{ action.title }}</div>
            <div class="action-description">{{ action.description }}</div>
          </div>

          <div class="action-footer">
            <div v-if="action.estimatedMinutes" class="estimated-time">
              <q-icon name="schedule" size="14px" />
              <span>{{ action.estimatedMinutes }}分钟</span>
            </div>
            <q-btn
              :label="action.actionLabel"
              color="primary"
              unelevated
              no-caps
              size="sm"
              class="action-btn"
            >
              <q-icon name="arrow_forward" size="16px" class="q-ml-xs" />
            </q-btn>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section v-if="recommendations.length > 3" class="more-actions">
      <q-btn
        flat
        no-caps
        color="primary"
        label="查看全部建议"
        icon-right="expand_more"
        @click="showAllRecommendations"
      />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useRecommendations } from '../../composables/useRecommendations'
import type { RecommendedAction } from '../../services/recommendations/RecommendationEngine'

const router = useRouter()
const {
  topRecommendations,
  recommendations,
  welcomeMessage,
  progressTip,
  isAnalyzing,
  refreshRecommendations
} = useRecommendations()

/**
 * 处理行动点击
 */
const handleAction = (action: RecommendedAction) => {
  if (action.handler) {
    action.handler()
  } else if (action.route) {
    router.push(action.route)
  }
}

/**
 * 显示所有推荐
 */
const showAllRecommendations = () => {
  // TODO: 打开一个对话框显示所有推荐
}
</script>

<style lang="scss" scoped>
.recommendations-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: white;

  .card-header-gradient {
    background: linear-gradient(135deg, var(--q-primary) 0%, #1E40AF 100%);
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.3;
    }
  }

  .card-header {
    position: relative;
    z-index: 1;
    padding: 1.5rem 1.5rem 1rem;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;

      .welcome-section {
        flex: 1;

        .greeting {
          font-size: 1.75rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .encouragement {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.95);
          line-height: 1.6;
        }
      }
    }

    .progress-tip {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: white;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  }

  .recommendations-list {
    padding: 1.5rem;

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--q-dark);
      margin-bottom: 1.25rem;

      .q-icon {
        color: var(--q-warning);
        font-size: 24px;
      }
    }

    .no-recommendations {
      text-align: center;
      padding: 3rem 1rem;

      .message {
        font-size: 1.1rem;
        font-weight: 500;
        color: var(--q-positive);
        margin-top: 1rem;
      }

      .sub-message {
        font-size: 0.9rem;
        color: var(--q-dark);
        opacity: 0.7;
        margin-top: 0.5rem;
      }
    }

    .action-cards {
      display: grid;
      gap: 1rem;

      .action-card {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 1rem;
        align-items: center;
        padding: 1.25rem;
        border-radius: 12px;
        background: white;
        border: 2px solid #f0f0f0;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: var(--q-primary);
          transition: width 0.3s ease;
        }

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-color: var(--q-primary);
          
          &::before {
            width: 6px;
          }

          .action-icon-wrapper {
            transform: scale(1.1) rotate(5deg);
          }

          .action-btn {
            transform: translateX(4px);
          }
        }

        &.category-setup::before {
          background: linear-gradient(135deg, var(--q-primary), #1E40AF);
        }

        &.category-network::before {
          background: linear-gradient(135deg, var(--q-info), #2563EB);
        }

        &.category-social::before {
          background: linear-gradient(135deg, #3B82F6, #2563EB);
        }

        &.category-service::before {
          background: linear-gradient(135deg, var(--q-warning), #D97706);
        }

        &.category-optimization::before {
          background: linear-gradient(135deg, var(--q-positive), #15803D);
        }

        .action-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(var(--q-primary-rgb), 0.1), rgba(var(--q-primary-rgb), 0.05));
          transition: all 0.3s ease;
          flex-shrink: 0;

          .action-icon {
            color: var(--q-primary);
          }
        }

        &.category-network .action-icon-wrapper {
          background: linear-gradient(135deg, rgba(var(--q-info-rgb), 0.1), rgba(var(--q-info-rgb), 0.05));
          .action-icon { color: var(--q-info); }
        }

        &.category-social .action-icon-wrapper {
          background: linear-gradient(135deg, rgba(var(--q-secondary-rgb), 0.1), rgba(var(--q-secondary-rgb), 0.05));
          .action-icon { color: var(--q-secondary); }
        }

        &.category-service .action-icon-wrapper {
          background: linear-gradient(135deg, rgba(var(--q-warning-rgb), 0.1), rgba(var(--q-warning-rgb), 0.05));
          .action-icon { color: var(--q-warning); }
        }

        &.category-optimization .action-icon-wrapper {
          background: linear-gradient(135deg, rgba(var(--q-positive-rgb), 0.1), rgba(var(--q-positive-rgb), 0.05));
          .action-icon { color: var(--q-positive); }
        }

        .action-info {
          min-width: 0;

          .action-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--q-dark);
            margin-bottom: 0.375rem;
            line-height: 1.3;
          }

          .action-description {
            font-size: 0.875rem;
            color: var(--q-dark);
            line-height: 1.5;
            opacity: 0.7;
          }
        }

        .action-footer {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
          flex-shrink: 0;

          .estimated-time {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            color: var(--q-dark);
            opacity: 0.5;
            white-space: nowrap;
          }

          .action-btn {
            transition: transform 0.3s ease;
          }
        }
      }
    }
  }

  .more-actions {
    text-align: center;
    padding: 0 1.5rem 1.5rem;
    border-top: 1px solid #f0f0f0;
    padding-top: 1rem;
  }
}

// 暗色主题
.body--dark {
  .recommendations-card {
    background: #1e1e1e;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    .card-header-gradient {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
    }

    .recommendations-list {
      .section-title {
        color: var(--q-dark-page);
      }

      .action-cards {
        .action-card {
          background: #2a2a2a;
          border-color: #3a3a3a;

          &:hover {
            border-color: var(--q-primary);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          }

          .action-info {
            .action-title {
              color: var(--q-dark-page);
            }

            .action-description {
              color: var(--q-dark-page);
            }
          }

          .action-footer {
            .estimated-time {
              color: var(--q-dark-page);
            }
          }
        }
      }
    }

    .more-actions {
      border-top-color: #3a3a3a;
    }
  }
}
</style>
