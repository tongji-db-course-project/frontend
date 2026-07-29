import request from '../utils/request'
import { roleMock } from '../mock/role'
import type {
  Role,
  RoleListParams,
  RoleListResult,
  UpdateRoleParams,
} from '../types/role'

const useRoleLocalMock =
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_ROLE_LOCAL_MOCK === 'true'

export const roleApi = {
  getList(params: RoleListParams) {
    if (useRoleLocalMock) {
      return roleMock.getRoleList(params)
    }

    return request.get<RoleListResult, RoleListResult>('/roles', {
      params,
    })
  },

  getDetail(roleId: number) {
    if (useRoleLocalMock) {
      return roleMock.getRoleDetail(roleId)
    }

    return request.get<Role, Role>(`/roles/${roleId}`)
  },

  update(roleId: number, data: UpdateRoleParams) {
    if (useRoleLocalMock) {
      return roleMock.updateRole(roleId, data)
    }

    return request.put<Role, Role, UpdateRoleParams>(
      `/roles/${roleId}`,
      data,
    )
  },

  remove(roleId: number) {
    if (useRoleLocalMock) {
      return roleMock.deleteRole(roleId)
    }

    return request.delete<null, null>(`/roles/${roleId}`)
  },
}
