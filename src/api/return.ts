import request from '../utils/request'
import type { PageResult } from '../types/common'
import type {
  CreateReturnPayload,
  ReturnDetail,
  ReturnOrder,
  ReturnQuery,
} from '../types/return'

const RETURN_PATH = '/return-orders'

export const returnApi = {
  getList(params: ReturnQuery) {
    return request.get<unknown, PageResult<ReturnOrder>>(RETURN_PATH, { params })
  },
  async getDetail(returnId: number) {
    const result = await request.get<unknown, ReturnDetail>(`${RETURN_PATH}/${returnId}`)
    return { ...result, items: result.items ?? result.details ?? [] }
  },
  create(data: CreateReturnPayload) {
    return request.post<unknown, ReturnOrder>(RETURN_PATH, data)
  },
  confirm(returnId: number) {
    return request.post<unknown, ReturnDetail>(`${RETURN_PATH}/${returnId}/confirm`)
  },
  reject(returnId: number, data: { approverId: number; remark?: string | null }) {
    return request.post<unknown, ReturnDetail>(`${RETURN_PATH}/${returnId}/reject`, {
      operatorId: data.approverId,
      remark: data.remark,
    })
  },
}
