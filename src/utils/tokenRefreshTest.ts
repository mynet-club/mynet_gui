import { tokenManager } from '../utils/tokenManager'

// Token 刷新功能测试
export const testTokenRefresh = async () => {
  console.log('🧪 [Test] Starting token refresh test...')
  
  try {
    // 1. 设置一个即将过期的 token
    const testTokenData = {
      access_token: 'test_token_' + Date.now(),
      refresh_token: 'test_refresh_token_' + Date.now(),
      expires_at: Date.now() + 1000, // 1秒后过期
      token_type: 'Bearer'
    }
    
    console.log('🧪 [Test] Saving test token that expires in 1 second...')
    tokenManager.saveTokenData(testTokenData)
    
    // 2. 等待 token 过期
    console.log('🧪 [Test] Waiting for token to expire...')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 3. 检查 token 是否过期
    const isExpired = tokenManager.isTokenExpired()
    console.log('🧪 [Test] Token expired:', isExpired)
    
    if (!isExpired) {
      throw new Error('Token should be expired but is not')
    }
    
    // 4. 尝试刷新 token
    console.log('🧪 [Test] Attempting to refresh token...')
    const newToken = await tokenManager.refreshToken()
    
    console.log('🧪 [Test] Token refresh successful, new token:', newToken.substring(0, 20) + '...')
    
    // 5. 验证新 token 未过期
    const isNewTokenExpired = tokenManager.isTokenExpired()
    console.log('🧪 [Test] New token expired:', isNewTokenExpired)
    
    if (isNewTokenExpired) {
      throw new Error('New token should not be expired')
    }
    
    console.log('✅ [Test] Token refresh test completed successfully!')
    
  } catch (error) {
    console.error('❌ [Test] Token refresh test failed:', error)
    throw error
  }
}

// 自动刷新测试
export const testAutoRefresh = () => {
  console.log('🧪 [Test] Starting auto-refresh test...')
  
  // 设置一个在30秒后过期的 token（会在25秒时自动刷新）
  const testTokenData = {
    access_token: 'auto_test_token_' + Date.now(),
    refresh_token: 'auto_test_refresh_token_' + Date.now(),
    expires_at: Date.now() + 30000, // 30秒后过期
    token_type: 'Bearer'
  }
  
  console.log('🧪 [Test] Setting token that expires in 30 seconds (should auto-refresh in 25 seconds)...')
  tokenManager.saveTokenData(testTokenData)
  
  console.log('🧪 [Test] Auto-refresh test setup complete. Watch for automatic refresh in ~25 seconds.')
}

// Token 生命周期信息
export const getTokenInfo = () => {
  const token = tokenManager.getAccessToken()
  const expiry = tokenManager.getTokenExpiry()
  const remaining = tokenManager.getTokenRemainingTime()
  const isExpired = tokenManager.isTokenExpired()
  const isNearExpiry = tokenManager.isTokenNearExpiry()
  
  return {
    hasToken: !!token,
    token: token ? token.substring(0, 20) + '...' : null,
    expiryTime: expiry ? new Date(expiry).toLocaleString() : null,
    remainingMinutes: remaining,
    isExpired,
    isNearExpiry
  }
}
