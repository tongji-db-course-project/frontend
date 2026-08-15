export interface MenuItem {
  menuId: number
  menuName: string
  menuUrl?: string | null
  parentId: number
  menuOrder?: number | null
}
