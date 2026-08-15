import request from '../utils/request'
import type { PageResult } from '../types/common'
import type { PointQuery, PointRecord } from '../types/point'

export const pointApi = {
  getList(params: PointQuery) {
    return request.get<unknown, PageResult<PointRecord>>('/points', { params })
  },
}
