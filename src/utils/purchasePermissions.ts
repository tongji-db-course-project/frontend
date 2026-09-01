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

export const canManagePurchase = () => hasAnyRole('店长', '管理员', '采购员')

export const canApproveOrStockIn = () => hasAnyRole('店长', '管理员', '库存管理员')

export const canCreatePurchase = () => hasAnyRole('店长', '管理员', '采购员')

export const canEditPurchaseBeforeApproval = (status?: string) =>
  status === '待审批' && hasAnyRole('店长', '管理员', '采购员')

export const canCancelPurchaseBeforeApproval = (status?: string) =>
  status === '待审批' && hasAnyRole('店长', '管理员', '采购员')
