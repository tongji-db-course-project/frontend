import axios from 'axios'
import { ElMessage } from 'element-plus'

const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '')

const request = axios.create({
  baseURL,
  timeout: 10000,
})

// 状态码对应表
const codeMessage: Record<number, string> = {
  400: '请求参数错误',
  401: '未登录或登录状态失效',
  403: '无权限访问',
  404: '资源不存在',
  500: '服务器内部错误',
}

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return res.data //直接返回数据部分
    }
    
    //处理业务型错误
    const msg = res.message || '操作失败'
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  },
  (error) => {
    //处理非2xx的HTTP状态码
    const status = error.response?.status
    const serverMessage = error.response?.data?.message 
    const message = serverMessage || codeMessage[status] || '网络请求异常'

    ElMessage.error(message)

    if (status === 401) {
      // 可以在这里处理清除 token 并跳转登录页
      localStorage.removeItem('token')
      // window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default request