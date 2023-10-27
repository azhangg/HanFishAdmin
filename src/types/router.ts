import type { RouteRecordRaw } from 'vue-router'
export interface RawConfig {
  hidden?: boolean
  alwaysShow?: boolean
  code?: number
  name?: string
  fullPath?: string
  path?: string
  meta?: {
    title: string
    icon?: string
    affix?: boolean
    activeMenu?: string
    breadcrumb?: boolean
    roles?: Array<string>
    elSvgIcon?: string
    code?: number
    cachePage?: boolean
    leaveRmCachePage?: boolean
    closeTabRmCache?: boolean
  }
  children?: RawConfig
  redirect?: string
}
export type RouteRawConfig = RouteRecordRaw | RawConfig
export type RouterTypes = Array<any>
