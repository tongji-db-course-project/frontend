import { hasAnyRole } from './purchasePermissions'

// 销售退货职责分离：收银员发起，管理员审核，采购员兼任仓储执行入库。
export const canCreateSalesReturn = () => hasAnyRole('收银员')
export const canReviewSalesReturn = () => hasAnyRole('管理员')
export const canStockInSalesReturn = () => hasAnyRole('采购员')

// 采购退货由采购员发起和执行出库，管理员独立审核。
export const canCreatePurchaseReturn = () => hasAnyRole('采购员')
export const canReviewPurchaseReturn = () => hasAnyRole('管理员')
export const canCompletePurchaseReturn = () => hasAnyRole('采购员')
export const canCancelPurchaseReturn = () => hasAnyRole('采购员')
