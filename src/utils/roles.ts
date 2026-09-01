const roleAliases: Record<string, string> = {
  系统管理员: '管理员',
  超级管理员: '管理员',
}

export const normalizeRoleName = (roleName?: string | null) => {
  const value = (roleName || '').trim()
  return roleAliases[value] || value
}

