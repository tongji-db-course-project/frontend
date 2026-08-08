import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { Member, MemberDto, MemberQuery } from '../types/member'
import type { SaleOrder } from '../types/sale'

const memberPath = '/members'

export const memberApi = {
  getList(params: MemberQuery) {
    return request.get<unknown, PageResult<Member>>(memberPath, { params })
  },

  create(data: MemberDto) {
    return request.post<unknown, Member>(memberPath, data)
  },

  getDetail(memberId: number) {
    return request.get<unknown, Member>(`${memberPath}/${memberId}`)
  },

  update(memberId: number, data: MemberDto) {
    return request.put<unknown, Member>(`${memberPath}/${memberId}`, data)
  },

  remove(memberId: number) {
    return request.delete<unknown, null>(`${memberPath}/${memberId}`)
  },

  getByPhone(phone: string) {
    return request.get<unknown, Member>(`${memberPath}/phone/${encodeURIComponent(phone)}`)
  },

  getOrders(memberId: number, page: number, size: number) {
    return request.get<unknown, PageResult<SaleOrder>>(`${memberPath}/${memberId}/orders`, {
      params: { page, size },
    })
  },
}
