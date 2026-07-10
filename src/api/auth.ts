import request from '../utils/request'
import type { LoginResponse, LoginParams } from '../types/auth'

const loginPath = import.meta.env.VITE_AUTH_LOGIN_PATH || '/auth/login'

// 开发时可通过 VITE_USE_LOCAL_MOCK=true 启用前端本地 mock，方便离线测试
const useLocalMock = import.meta.env.VITE_USE_LOCAL_MOCK === 'true'
const mockUsername = import.meta.env.VITE_MOCK_USERNAME || 'demo'
const mockPassword = import.meta.env.VITE_MOCK_PASSWORD || '123456'
const mockToken = import.meta.env.VITE_MOCK_TOKEN || 'mock-token-dev'
const mockUserId = Number(import.meta.env.VITE_MOCK_USER_ID || 1)
const mockRealName = import.meta.env.VITE_MOCK_REAL_NAME || '演示用户'
const mockRoleName = import.meta.env.VITE_MOCK_ROLE_NAME || '演示角色'

export const authApi = {
  async login(data: LoginParams) {
    if (useLocalMock) { //本地mock模式，模拟登录接口，后续可删
      await new Promise((r) => setTimeout(r, 400))

      if (data.username === mockUsername && data.password === mockPassword) {
        const mockData: LoginResponse = {
          token: mockToken,
          userId: mockUserId,
          username: mockUsername,
          realName: mockRealName,
          roleName: mockRoleName,
        }
        return mockData
      }

      return Promise.reject({ code: 400, message: '密码错误', data: null })
    }

    return request.post<any, LoginResponse>(loginPath, data)
  }
}