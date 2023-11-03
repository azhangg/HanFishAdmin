export interface MenuRaw {
  id: number
  name: string
  title: string
  hidden: boolean
  pId: number | null
  alwaysShow?: boolean
  icon?: string
  affix?: boolean
  cachePage?: boolean
  leaveRmCachePage?: boolean
  closeTabRmCache?: boolean
  redirect?: string
  order: number
  children: MenuRaw[]
  createTime: string
}
