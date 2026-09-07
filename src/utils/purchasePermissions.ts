import { useAuthStore } from '../stores/auth'
import { normalizeRoleName } from './roles'

export const getCurrentRoleName = () => {
  const authStore = useAuthStore()
  const roleName = normalizeRoleName(authStore.userInfo?.roleName) || normalizeRoleName(localStorage.getItem('currentRoleName')) || '采购员'
  return roleName
}

export const hasAnyRole = (...allowedRoles: string[]) => {
  const currentRole = getCurrentRoleName()
  return allowedRoles.some((role) => currentRole === role)
}

export const canManagePurchase = () => hasAnyRole('管理员', '采购员')

export const canApproveOrStockIn = () => hasAnyRole('管理员', '采购员')

export const canCreatePurchase = () => hasAnyRole('管理员', '采购员')

// 可编辑状态：待审批（提交前）、已驳回（被打回修改）
export const canEditPurchaseBeforeApproval = (status?: string) =>
  (status === '待审批' || status === '已驳回') && hasAnyRole('管理员', '采购员')

// 可作废状态：待审批/已驳回/已审批；已入库、已作废不可作废（后端一致）
export const canCancelPurchaseBeforeApproval = (status?: string) =>
  (status === '待审批' || status === '已驳回' || status === '已审批') && hasAnyRole('管理员', '采购员')
