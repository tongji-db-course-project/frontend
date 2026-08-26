import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { CreateUserPayload, SystemUser, UpdateUserPayload, UserQuery } from '../types/user'

export const userApi = {
  getList: (params: UserQuery) => request.get<unknown, PageResult<SystemUser>>('/users', { params }),
  getDetail: (userId: number) => request.get<unknown, SystemUser>(`/users/${userId}`),
  create: (data: CreateUserPayload) => request.post<unknown, SystemUser>('/users', data),
  update: (userId: number, data: UpdateUserPayload) => request.put<unknown, SystemUser>(`/users/${userId}`, data),
  changeStatus: (userId: number, status: string) => request.patch<unknown, SystemUser>(`/users/${userId}/status`, { status }),
}
