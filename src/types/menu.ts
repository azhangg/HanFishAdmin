export interface MenuRaw {
  id: number
  name: string
  title: string
  hidden: boolean
  pId: number | null
  awalwaysShow?: boolean
  icon?: string
  affix?: boolean
  cachePage?: boolean
  leaveRmCachePage?: boolean
  closeTabRmCache?: boolean
  redirect?: string
  children: MenuRaw[]
}
