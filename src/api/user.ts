import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { CreateUserPayload, SystemUser, UpdateUserPayload, UserQuery } from '../types/user'

export const userApi = {
  getList(params: UserQuery) {
    return request.get<unknown, PageResult<SystemUser>>('/users', { params })
  },
  getDetail(userId: number) {
    return request.get<unknown, SystemUser>(`/users/${userId}`)
  },
  create(data: CreateUserPayload) {
    return request.post<unknown, SystemUser>('/users', data)
  },
  update(userId: number, data: UpdateUserPayload) {
    return request.put<unknown, SystemUser>(`/users/${userId}`, data)
  },
  changeStatus(userId: number, status: string) {
    return request.patch<unknown, SystemUser>(`/users/${userId}/status`, { status })
  },
}
