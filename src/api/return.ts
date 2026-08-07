import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { CreateReturnPayload, ReturnDetail, ReturnOrder, ReturnQuery } from '../types/return'

export const returnApi = {
  getList(params: ReturnQuery) {
    return request.get<unknown, PageResult<ReturnOrder>>('/returns', { params })
  },
  getDetail(returnId: number) {
    return request.get<unknown, ReturnDetail>(`/returns/${returnId}`)
  },
  create(data: CreateReturnPayload) {
    return request.post<unknown, ReturnDetail>('/returns', data)
  },
}
