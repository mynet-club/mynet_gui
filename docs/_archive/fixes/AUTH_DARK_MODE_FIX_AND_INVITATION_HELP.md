# 认证页面Dark模式修复 & 邀请码获取功能

## 📋 修改概述

本次更新解决了两个问题：
1. **Dark模式下文字颜色问题** - 修复了注册/登录页面在深色模式下文字不可见的问题
2. **邀请码获取提示** - 在注册页面添加了邀请码获取帮助对话框

---

## 🔧 修改内容

### 1. Dark模式样式修复

**文件**: `src/styles/auth.scss`

**修改内容**:
- 为`.auth-card`在dark模式下添加了正确的文字颜色
- 标题（auth-title）使用 `var(--q-grey-1)` 确保可见性
- 副标题（auth-subtitle）使用 `var(--q-grey-5)`
- 页脚文字使用 `var(--q-grey-4)`
- 输入框文字使用 `var(--q-grey-1)`
- Placeholder文字使用 `var(--q-grey-6)`
- 复选框标签使用 `var(--q-grey-3)`

**修复前问题**:
```scss
// 只有背景色和边框，没有文字颜色定义
.body--dark {
  .auth-card {
    background: var(--q-dark);
    border: 1px solid var(--q-dark-page);
  }
}
```

**修复后**:
```scss
.body--dark {
  .auth-card {
    background: var(--q-dark);
    border: 1px solid var(--q-dark-page);
    
    .auth-header {
      .auth-title {
        color: var(--q-grey-1);  // 主标题高亮
      }
      .auth-subtitle {
        color: var(--q-grey-5);  // 副标题稍暗
      }
    }
    
    // 输入框文字
    .q-field__control {
      color: var(--q-grey-1);
    }
    
    // Placeholder颜色
    .q-field__native::placeholder {
      color: var(--q-grey-6);
    }
    
    // 复选框标签
    .q-checkbox__label {
      color: var(--q-grey-3);
    }
  }
}
```

---

### 2. 邀请码获取功能

#### 2.1 i18n文本添加

**中文** (`src/i18n/zh-CN.ts`):
```typescript
noInvitationCode: '没有邀请码？',
getInvitationCode: '获取邀请码',
invitationCodeHelp: '如何获取邀请码',
invitationCodeHelpTitle: '获取邀请码',
invitationCodeHelpMessage: 'MyNet 采用邀请注册机制，请加入我们的社区获取邀请码：',
joinCommunity: '加入社区',
telegramCommunity: 'Telegram 社区',
discordCommunity: 'Discord 社区',
visitVillage: '访问社区页面',
communityLinks: '社区链接',
```

**英文** (`src/i18n/en-US.ts`):
```typescript
noInvitationCode: "Don't have an invitation code?",
getInvitationCode: 'Get Invitation Code',
invitationCodeHelp: 'How to get invitation code',
invitationCodeHelpTitle: 'Get Invitation Code',
invitationCodeHelpMessage: 'MyNet uses an invitation-based registration system. Please join our community to get an invitation code:',
joinCommunity: 'Join Community',
telegramCommunity: 'Telegram Community',
discordCommunity: 'Discord Community',
visitVillage: 'Visit Community Page',
communityLinks: 'Community Links',
```

#### 2.2 注册表单更新

**文件**: `src/components/auth/RegisterForm.vue`

**新增功能**:
1. **邀请码字段下方添加帮助按钮**
   ```vue
   <div class="invitation-field-wrapper">
     <q-input v-model="registerForm.invitation" ... />
     
     <div class="invitation-help">
       <q-btn
         flat
         dense
         size="sm"
         color="primary"
         :label="$t('auth.noInvitationCode')"
         @click="showInvitationHelp = true"
       />
     </div>
   </div>
   ```

2. **帮助对话框**
   ```vue
   <q-dialog v-model="showInvitationHelp">
     <q-card>
       <q-card-section>
         <div class="text-h6">获取邀请码</div>
       </q-card-section>
       
       <q-card-section>
         <p>MyNet 采用邀请注册机制...</p>
         
         <div class="community-links">
           <q-btn @click="openTelegram">Telegram 社区</q-btn>
           <q-btn @click="openDiscord">Discord 社区</q-btn>
           <q-btn @click="openVillage">访问社区页面</q-btn>
         </div>
       </q-card-section>
     </q-card>
   </q-dialog>
   ```

3. **社区链接处理**
   ```typescript
   // 所有链接都指向 https://mynet.club/village
   const openTelegram = () => {
     window.open('https://mynet.club/village', '_blank')
     showInvitationHelp.value = false
   }
   
   const openDiscord = () => {
     window.open('https://mynet.club/village', '_blank')
     showInvitationHelp.value = false
   }
   
   const openVillage = () => {
     window.open('https://mynet.club/village', '_blank')
     showInvitationHelp.value = false
   }
   ```

4. **样式优化**
   ```scss
   .invitation-field-wrapper {
     position: relative;
     
     .invitation-help {
       margin-top: 0.5rem;
       text-align: right;
       
       .invitation-help-btn {
         font-size: 0.75rem;
         text-transform: none;
       }
     }
   }
   
   // Dark模式下的对话框优化
   .body--dark {
     .q-card {
       background: var(--q-dark);
       color: var(--q-grey-1);
     }
   }
   ```

---

## 🎨 视觉效果

### Light模式
- ✅ 所有文字清晰可见
- ✅ 颜色对比度良好
- ✅ 按钮和链接颜色正常

### Dark模式
- ✅ 标题使用亮色文字（grey-1）
- ✅ 输入框文字清晰可见
- ✅ Placeholder有适当的对比度
- ✅ 复选框标签可读
- ✅ 对话框背景和文字协调

---

## 🔍 用户流程

### 注册流程（无邀请码）
1. 用户访问注册页面
2. 填写姓名、邮箱、密码
3. 在邀请码字段下方看到 **"没有邀请码？"** 按钮
4. 点击按钮弹出帮助对话框
5. 对话框显示三个选项：
   - Telegram 社区
   - Discord 社区
   - 访问社区页面（主要入口）
6. 点击任一按钮打开 https://mynet.club/village
7. 在社区页面获取邀请码
8. 返回注册页面填写邀请码完成注册

### 注册流程（有邀请码）
1. 直接填写表单
2. 输入邀请码
3. 提交注册

---

## 📱 响应式设计

对话框在不同设备上的表现：
- **移动端**: 最小宽度350px，适应小屏幕
- **平板/桌面**: 最大宽度500px，居中显示
- **按钮布局**: 全宽按钮，易于点击

---

## ✅ 测试检查清单

### Dark模式测试
- [ ] 登录页面 - 标题可见
- [ ] 登录页面 - 输入框文字可见
- [ ] 登录页面 - Placeholder可见
- [ ] 登录页面 - 复选框标签可见
- [ ] 注册页面 - 所有文字可见
- [ ] 注册页面 - 邀请码帮助按钮可见

### 邀请码功能测试
- [ ] 点击"没有邀请码？"按钮
- [ ] 对话框正常弹出
- [ ] 对话框在Dark模式下显示正常
- [ ] 点击"Telegram 社区"打开 mynet.club/village
- [ ] 点击"Discord 社区"打开 mynet.club/village
- [ ] 点击"访问社区页面"打开 mynet.club/village
- [ ] 点击链接后对话框自动关闭
- [ ] 点击关闭按钮对话框关闭

### 功能测试
- [ ] 注册流程完整可用
- [ ] URL参数邀请码自动填充仍然工作
- [ ] 表单验证正常
- [ ] 提交注册成功

---

## 🌐 社区链接说明

当前所有社区按钮都链接到: **https://mynet.club/village**

这是因为：
1. 统一的社区入口页面
2. 用户可以在该页面找到所有社区链接
3. 便于后期维护和更新具体的Telegram/Discord链接

如需分别链接到不同社区：
```typescript
const openTelegram = () => {
  window.open('https://t.me/your_telegram_group', '_blank')
}

const openDiscord = () => {
  window.open('https://discord.gg/your_discord_server', '_blank')
}
```

---

## 📝 后续优化建议

1. **多语言优化**
   - 可以根据用户语言环境显示对应社区（中文用户显示微信/QQ等）

2. **社区链接配置化**
   - 将社区链接放入配置文件
   - 便于不同环境使用不同链接

3. **邀请码验证**
   - 可以添加邀请码格式预验证
   - 提前告知用户邀请码格式错误

4. **统计追踪**
   - 记录用户点击社区链接的次数
   - 分析用户获取邀请码的渠道偏好

---

*更新时间: 2026-01-06*  
*更新内容: Dark模式文字颜色修复 + 邀请码获取功能*
