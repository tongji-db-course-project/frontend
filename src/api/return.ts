import request from '../utils/request'
import type { PageResult } from '../types/common'
import type {
  CreateReturnPayload,
  ReturnApprovalPayload,
  ReturnConfirmResult,
  ReturnDetail,
  ReturnOrder,
  ReturnQuery,
  ReturnStatusResult,
} from '../types/return'

export const returnApi = {
  getList(params: ReturnQuery) {
    return request.get<unknown, PageResult<ReturnOrder>>('/return-orders', { params })
  },
  getDetail(returnId: number) {
    return request.get<unknown, ReturnDetail>(`/return-orders/${returnId}`)
  },
  create(data: CreateReturnPayload) {
    return request.post<unknown, ReturnOrder>('/return-orders', data)
  },
  confirm(returnId: number) {
    return request.post<unknown, ReturnConfirmResult>(`/return-orders/${returnId}/confirm`)
  },
  reject(returnId: number, data: ReturnApprovalPayload) {
    return request.post<unknown, ReturnStatusResult>(`/return-orders/${returnId}/reject`, data)
  },
}
