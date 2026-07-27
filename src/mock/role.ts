import type {
  Role,
  RoleListParams,
  RoleListResult,
  UpdateRoleParams,
} from '../types/role'

const STORAGE_KEY = 'database-project-role-mock-v1'

const defaultRoles: Role[] = [
  {
    roleId: 1,
    roleName: '系统管理员',
    roleDesc: '拥有系统全部权限',
  },
  {
    roleId: 2,
    roleName: '采购员',
    roleDesc: '负责采购业务管理',
  },
  {
    roleId: 3,
    roleName: '收银员',
    roleDesc: '负责销售收银和退货办理',
  },
]

const delay = (time = 300) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, time)
  })

const cloneRoles = (roles: Role[]): Role[] => {
  return roles.map((role) => ({ ...role }))
}

const saveRoles = (roles: Role[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roles))
}

const readRoles = (): Role[] => {
  const stored = localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    const initialRoles = cloneRoles(defaultRoles)
    saveRoles(initialRoles)
    return initialRoles
  }

  try {
    const roles = JSON.parse(stored)

    if (Array.isArray(roles)) {
      return roles
    }
  } catch {
    // 数据损坏时恢复默认数据
  }

  const initialRoles = cloneRoles(defaultRoles)
  saveRoles(initialRoles)
  return initialRoles
}

const getRoleList = async (
  params: RoleListParams,
): Promise<RoleListResult> => {
  await delay()

  const page = Math.max(1, Number(params.page) || 1)
  const size = Math.max(1, Number(params.size) || 10)
  const keyword = params.keyword?.trim().toLowerCase() || ''

  let roles = readRoles()

  if (keyword) {
    roles = roles.filter((role) =>
      role.roleName.toLowerCase().includes(keyword),
    )
  }

  const total = roles.length
  const start = (page - 1) * size
  const list = roles.slice(start, start + size)

  return {
    list: cloneRoles(list),
    total,
    page,
    size,
  }
}

const getRoleDetail = async (roleId: number): Promise<Role> => {
  await delay()

  const role = readRoles().find((item) => item.roleId === roleId)

  if (!role) {
    return Promise.reject({
      code: 404,
      message: '角色不存在',
      data: null,
    })
  }

  return { ...role }
}

const updateRole = async (
  roleId: number,
  data: UpdateRoleParams,
): Promise<Role> => {
  await delay()

  const roles = readRoles()
  const index = roles.findIndex((item) => item.roleId === roleId)

  if (index === -1) {
    return Promise.reject({
      code: 404,
      message: '角色不存在',
      data: null,
    })
  }

  const updatedRole: Role = {
    roleId,
    roleName: data.roleName,
    roleDesc: data.roleDesc,
  }

  roles[index] = updatedRole
  saveRoles(roles)

  return { ...updatedRole }
}

const deleteRole = async (roleId: number): Promise<null> => {
  await delay()

  const roles = readRoles()
  const roleExists = roles.some((item) => item.roleId === roleId)

  if (!roleExists) {
    return Promise.reject({
      code: 404,
      message: '角色不存在',
      data: null,
    })
  }

  saveRoles(roles.filter((item) => item.roleId !== roleId))

  return null
}

export const roleMock = {
  getRoleList,
  getRoleDetail,
  updateRole,
  deleteRole,
}
