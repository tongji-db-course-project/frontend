import axios from 'axios'
import { ElMessage } from 'element-plus'


const baseURL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/$/, '')

const request = axios.create({
  baseURL,
  timeout: 10000,
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

const getErrorMessage = (statusCode: number | undefined, businessCode: number | undefined, serverMessage?: string) => {
  if (businessCode === 400) return serverMessage || '请求参数错误'
  if (businessCode === 401) return '未登录或登录状态失效'
  if (businessCode === 403) return '无权限访问该资源'
  if (businessCode === 500) return '服务器内部错误'
  if (statusCode === 401) return '未登录或登录状态失效'
  if (statusCode === 403) return '无权限访问该资源'
  if (statusCode === 500) return '服务器内部错误'
  if (statusCode === 408) return '请求超时，请稍后重试'
  return '请求失败，请稍后重试'
}

request.interceptors.response.use(
  (response) => {
    //HTTP成功
    if (response.status >= 200 && response.status < 300) {
      const res = response.data

      //业务成功
      if (res?.code === 200) {
        return res?.data ?? null
      }

      //业务错误
      const message = getErrorMessage(response.status, res?.code, res?.message)
      ElMessage.error(message)
      const err = { code: res?.code, message, data: res?.data ?? null, _handled: true }
      return Promise.reject(err)
    }

    //HTTP失败
    const message = getErrorMessage(response.status, response.data?.code, response.data?.message)
    ElMessage.error(message)
    const err = Object.assign(new Error(message), { _handled: true })
    return Promise.reject(err)
  },
  //网络错误
  (error) => {
    const status = error.response?.status
    const message = getErrorMessage(status, error.response?.data?.code, error.response?.data?.message)
    ElMessage.error(message)
    const err = Object.assign(error, { _handled: true, message })
    return Promise.reject(err)
  }
)

export default request
