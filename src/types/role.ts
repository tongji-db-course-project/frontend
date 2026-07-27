/**
 * 角色基础信息。
 * 字段与后端 sys_role 表及 OpenAPI Role 模型保持一致。
 */
export interface Role {
  roleId: number
  roleName: string
  roleDesc: string | null
}

/**
 * 角色分页查询参数。
 */
export interface RoleListParams {
  page: number
  size: number
  keyword?: string
}

/**
 * 角色分页查询结果。
 */
export interface RoleListResult {
  list: Role[]
  total: number
  page: number
  size: number
}

/**
 * 修改角色请求参数。
 */
export interface UpdateRoleParams {
  roleName: string
  roleDesc: string | null
}
