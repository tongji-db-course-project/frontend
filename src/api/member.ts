import request from '../utils/request'
import type { Member, MemberDto, MemberQuery, PageResult, SaleOrder } from '../types/member'

const memberPath = '/members'

export const memberApi = {
  getList(params: MemberQuery) {
    return request.get<never, PageResult<Member>>(memberPath, { params })
  },

  create(data: MemberDto) {
    return request.post<never, Member>(memberPath, data)
  },

  getDetail(memberId: number) {
    return request.get<never, Member>(`${memberPath}/${memberId}`)
  },

  update(memberId: number, data: MemberDto) {
    return request.put<never, Member>(`${memberPath}/${memberId}`, data)
  },

  remove(memberId: number) {
    return request.delete<never, null>(`${memberPath}/${memberId}`)
  },

  getByPhone(phone: string) {
    return request.get<never, Member>(`${memberPath}/phone/${encodeURIComponent(phone)}`)
  },

  getOrders(memberId: number, page: number, size: number) {
    return request.get<never, PageResult<SaleOrder>>(`${memberPath}/${memberId}/orders`, {
      params: { page, size },
    })
  },
}
