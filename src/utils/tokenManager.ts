import { LocalStorage } from 'quasar'
import debug from 'src/utils/debug'
import axios from 'axios';
import { api } from '../services/api';

export interface TokenData {
  auth_token: string;
  refresh_token: string;
  auth_token_expires_in: number;
  refresh_token_expires_in: number;
}

export class TokenManager {
  private static instance: TokenManager
  private refreshPromise: Promise<string> | null = null
  private refreshTimer: number | null = null
  private isRefreshing: boolean = false;
  private requestQueue: Array<() => Promise<any>> = [];

  private constructor() {}
  
  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }
  
  // 保存 token 数据
  saveTokenData(tokenData: TokenData) {
    LocalStorage.set('auth_token', tokenData.auth_token)
    LocalStorage.set('token_expiry', tokenData.auth_token_expires_in.toString())
    
    if (tokenData.refresh_token) {
      LocalStorage.set('refresh_token', tokenData.refresh_token)
    }
    
    debug.log('🔧 [TokenManager] Token data saved:', {
      access_token: tokenData.auth_token.substring(0, 20) + '...',
      expires_at: new Date(tokenData.auth_token_expires_in).toISOString(),
      has_refresh_token: !!tokenData.refresh_token
    })
    
    // 设置自动刷新定时器
    this.scheduleTokenRefresh(tokenData.auth_token_expires_in)
  }
  
  // 获取当前 token
  getAccessToken(): string | null {
    return LocalStorage.getItem('auth_token')
  }
  
  // 获取刷新 token
  getRefreshToken(): string | null {
    return LocalStorage.getItem('refresh_token')
  }
  
  // 获取 token 过期时间
  getTokenExpiry(): number {
    const expiry = LocalStorage.getItem('token_expiry')
    return expiry ? parseInt(expiry.toString()) : 0
  }
  
  // 检查 token 是否过期
  isTokenExpired(): boolean {
    const token = this.getAccessToken()
    if (!token) {
      return true // 没有token就认为是过期的
    }
    
    const expiry = this.getTokenExpiry()
    if (!expiry || expiry === 0) {
      return true // 没有过期时间也认为是过期的
    }
    
    const isExpired = Date.now() > expiry
    
    debug.log('🔧 [TokenManager] Token expiry check:', {
      currentTime: new Date().toISOString(),
      expiryTime: new Date(expiry).toISOString(),
      isExpired,
      hasToken: !!token
    })
    
    return isExpired
  }
  
  // 检查 token 是否即将过期（提前5分钟刷新）
  isTokenNearExpiry(): boolean {
    const expiry = this.getTokenExpiry()
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000)
    return fiveMinutesFromNow > expiry
  }
  
  // 刷新 token
  async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push(() => this.refreshToken().then(resolve).catch(reject));
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = this.getRefreshToken()
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }
      
      debug.log('🔧 [TokenManager] Starting token refresh...')
      
      const newAccessToken = await this.performTokenRefresh(refreshToken)
      debug.log('🔧 [TokenManager] Token refresh successful')
      return newAccessToken
    } catch (error) {
      debug.error('🔧 [TokenManager] Token refresh failed:', error)
      throw error
    } finally {
      this.isRefreshing = false;
      this.processQueue();
    }
  }
  
  // 执行 token 刷新请求
  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await api.post('/auth/refresh-token', {
        refresh_token: refreshToken
      });

      const data = response.data;

      let expiresAt = Date.now() + (60 * 60 * 1000); // 默认1小时

      // 处理不同的响应格式
      const tokenData = data.success ? data.data : data;

      if (tokenData.expires_at) {
        if (typeof tokenData.expires_at === 'number') {
          expiresAt = tokenData.expires_at;
        } else {
          expiresAt = new Date(tokenData.expires_at).getTime();
        }
      } else if (tokenData.expires_in) {
        expiresAt = Date.now() + (tokenData.expires_in * 1000);
      }

      const newTokenData: TokenData = {
        auth_token: tokenData.auth_token || tokenData.access_token || tokenData.token,
        refresh_token: tokenData.refresh_token || refreshToken,
        auth_token_expires_in: expiresAt,
        refresh_token_expires_in: expiresAt, // 假设刷新令牌过期时间与访问令牌相同
      };

      this.saveTokenData(newTokenData);
      return newTokenData.auth_token;
    } catch (error) {
      debug.error('🔧 [TokenManager] Token refresh API call failed:', error);
      this.clearTokens();
      throw error;
    }
  }
  
  // 设置自动刷新定时器
  private scheduleTokenRefresh(expiryTime: number) {
    // 清除之前的定时器
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }
    
    // 在过期前5分钟刷新
    const refreshTime = expiryTime - Date.now() - (5 * 60 * 1000)
    
    debug.log('🔧 [TokenManager] Token refresh scheduling:', {
      expiryTime: new Date(expiryTime).toISOString(),
      currentTime: new Date().toISOString(),
      refreshTime: refreshTime,
      refreshTimeMinutes: Math.round(refreshTime / 1000 / 60)
    })
    
    if (refreshTime > 0) {
      debug.log('🔧 [TokenManager] Scheduling token refresh in', Math.round(refreshTime / 1000 / 60), 'minutes')
      
      this.refreshTimer = window.setTimeout(() => {
        debug.log('🔧 [TokenManager] Auto-refreshing token...')
        this.refreshToken().catch(error => {
          debug.error('🔧 [TokenManager] Auto-refresh failed:', error)
          // 可以在这里触发登出或重新登录
        })
      }, refreshTime)
    } else if (refreshTime > -60 * 60 * 1000) {
      // 如果已经过了刷新时间，但还没超过1小时，可能是时间差问题，延迟10秒再检查
      debug.log('🔧 [TokenManager] Token may be expired or expiring soon, scheduling delayed check in 10 seconds')
      this.refreshTimer = window.setTimeout(() => {
        // 再次检查 token 是否真的过期
        if (this.isTokenExpired()) {
          debug.log('🔧 [TokenManager] Token confirmed expired, attempting refresh...')
          this.refreshToken().catch(error => {
            debug.error('🔧 [TokenManager] Delayed refresh failed:', error)
          })
        } else {
          debug.log('🔧 [TokenManager] Token is still valid, rescheduling...')
          this.scheduleTokenRefresh(expiryTime)
        }
      }, 10000) // 10秒后执行
    } else {
      debug.log('🔧 [TokenManager] Token is too old, not scheduling refresh')
    }
  }
  
  // 清除所有 token
  clearTokens() {
    LocalStorage.remove('auth_token')
    LocalStorage.remove('refresh_token')
    LocalStorage.remove('token_expiry')
    
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    
    debug.log('🔧 [TokenManager] All tokens cleared')
  }
  
  // 获取 token 剩余时间（分钟）
  getTokenRemainingTime(): number {
    const expiry = this.getTokenExpiry()
    const remaining = expiry - Date.now()
    return Math.max(0, Math.round(remaining / 1000 / 60))
  }
  
  // 从外部恢复计时器
  public restoreTokenRefreshTimer() {
    const expiryTime = this.getTokenExpiry();
    if (expiryTime > Date.now()) {
      this.scheduleTokenRefresh(expiryTime);
    }
  }

  public isTokenRefreshing(): boolean {
    return this.isRefreshing;
  }

  public addToRequestQueue(requestFn: () => Promise<any>): void {
    this.requestQueue.push(requestFn);
  }

  private processQueue() {
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        request();
      }
    }
  }
}

export const tokenManager = TokenManager.getInstance()
