import request from '../utils/request'
import type { MenuItem } from '../types/menu'

export const menuApi = {
  getList() {
    return request.get<unknown, MenuItem[]>('/menus')
  },
}
