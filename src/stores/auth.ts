import { defineStore } from 'pinia'
import { authApi } from '../api/auth'
import type { LoginParams, LoginResponse } from '../types/auth'

const loadSavedUser = (): LoginResponse | null => {
  try {
    const value = localStorage.getItem('userInfo')
    return value ? JSON.parse(value) as LoginResponse : null
  } catch {
    localStorage.removeItem('userInfo')
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: loadSavedUser()
  }),
  actions: {
    async login(params: LoginParams) {
      // 调用 api 层
      const data = await authApi.login(params)

      if (!data || !data.token) {
        // 若后端未返回 token，则视为登录失败
        throw new Error('登录失败：后端未返回 token')
      }

      // 保存到 Store 状态中
      this.token = data.token
      this.userInfo = data
      // 持久化存储，防止刷新页面丢失
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify(data))
    },
    logout() {
      this.token = ''
      this.userInfo = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})
