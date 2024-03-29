import NProgress from 'nprogress'
import type { RouteRawConfig, RouterTypes, rawConfig } from '~/basic'
import type { RouteRecordName } from 'vue-router'
import type { MenuRaw } from '@/types/menu'
/**
 * 根据请求，过滤异步路由
 * @param:menuList 异步路由数组
 * return 过滤后的异步路由
 */
// @ts-ignore
import Layout from '@/layout/index.vue'
/*
 * 路由操作
 * */
import router, { constantRoutes, roleCodeRoutes } from '@/router'
//进度条
import 'nprogress/nprogress.css'
import { useBasicStore } from '@/store/basic'

const Page404 = import('@/views/error-page/404.vue')
const Page401 = import('@/views/error-page/401.vue')

const viewModules = import.meta.glob('@/views/**/*.vue', { eager: true })

export const menus = JSON.parse(localStorage.getItem('basic') ?? JSON.stringify({ asyncMenus: [] })).asyncMenus

const buttonCodes: Array<Number> = [] //按钮权限
interface menuRow {
  category: number
  code: number
  children: RouterTypes
}
export const filterAsyncRoutesByMenuList = (menuList) => {
  const filterRouter: RouterTypes = []
  menuList.forEach((route: menuRow) => {
    //button permission
    if (route.category === 3) {
      buttonCodes.push(route.code)
    } else {
      //generator every router item by menuList
      const itemFromReqRouter = getRouteItemFromReqRouter(route)
      if (route.children?.length) {
        //judge  the type is router or button
        itemFromReqRouter.children = filterAsyncRoutesByMenuList(route.children)
      }
      filterRouter.push(itemFromReqRouter)
    }
  })
  return filterRouter
}
const getRouteItemFromReqRouter = (route): RouteRawConfig => {
  const tmp: rawConfig = { meta: { title: '' } }
  const routeKeyArr = ['path', 'component', 'redirect', 'alwaysShow', 'name', 'hidden']
  const metaKeyArr = ['title', 'activeMenu', 'elSvgIcon', 'icon']
  // @ts-ignore
  const modules = import.meta.glob('../views/**/**.vue')
  //generator routeKey
  routeKeyArr.forEach((fItem) => {
    if (fItem === 'component') {
      if (route[fItem] === 'Layout') {
        tmp[fItem] = Layout
      } else {
        //has error , i will fix it through plugins
        //tmp[fItem] = () => import(`@/views/permission-center/test/TestTableQuery.vue`)
        tmp[fItem] = modules[`../views/${route[fItem]}`]
      }
    } else if (fItem === 'path' && route.parentId === 0) {
      tmp[fItem] = `/${route[fItem]}`
    } else if (['hidden', 'alwaysShow'].includes(fItem)) {
      tmp[fItem] = !!route[fItem]
    } else if (['name'].includes(fItem)) {
      tmp[fItem] = route['code']
    } else if (route[fItem]) {
      tmp[fItem] = route[fItem]
    }
  })
  //generator metaKey
  metaKeyArr.forEach((fItem) => {
    if (route[fItem] && tmp.meta) tmp.meta[fItem] = route[fItem]
  })
  //route extra insert
  if (route.extra) {
    Object.entries(route.extra.parse(route.extra)).forEach(([key, value]) => {
      if (key === 'meta' && tmp.meta) {
        tmp.meta[key] = value
      } else {
        tmp[key] = value
      }
    })
  }
  return tmp as RouteRawConfig
}

/**
 * 根据角色数组过滤异步路由
 * @param routes asyncRoutes 未过滤的异步路由
 * @param roles  角色数组
 * return 过滤后的异步路由
 */
export function filterAsyncRoutesByRoles(routes, roles) {
  const res: RouterTypes = []
  routes.forEach((route) => {
    const tmp: RouteRawConfig = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutesByRoles(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}
function hasPermission(roles, route) {
  if (route?.meta?.roles) {
    return roles?.some((role) => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * 根据code数组，过滤异步路由
 * @param codes code数组
 * @param codesRoutes 未过滤的异步路由
 * return 过滤后的异步路由
 */
export function filterAsyncRouterByCodes(codesRoutes, codes) {
  const filterRouter: RouterTypes = []
  codesRoutes.forEach((routeItem: RouteRawConfig) => {
    if (hasCodePermission(codes, routeItem)) {
      if (routeItem.children) routeItem.children = filterAsyncRouterByCodes(routeItem.children, codes)
      filterRouter.push(routeItem)
    }
  })
  return filterRouter
}
function hasCodePermission(codes, routeItem) {
  if (routeItem.meta?.code) {
    return codes.includes(routeItem.meta.code) || routeItem.hidden
  } else {
    return true
  }
}

function ToPromise(raw) {
  return new Promise<typeof raw>((resolve, _) => resolve(raw))
}

const getPage = (path: string) => {
  for (const view in viewModules) {
    if (view.includes(path)) {
      const component = viewModules[view]
      return ToPromise(component)
    }
  }
  return Page404
}

//根据菜单动态生成路由
export const generateRoutersByMenus = (menus: MenuRaw[], basePath: string) => {
  return menus.map<RouteRawConfig>((item) => {
    const path = `${basePath}${item.name.toLowerCase()}`
    return {
      name: item.name,
      path: item.pId == null ? path : item.name.toLowerCase(),
      hidden: item.hidden,
      alwaysShow: item.alwaysShow,
      redirect: item.redirect,
      component: () => (item.pId ? getPage(path) : ToPromise(Layout)),
      meta: {
        title: item.title,
        icon: item.icon,
        affix: item.affix,
        cachePage: item.cachePage,
        closeTabRmCache: item.closeTabRmCache,
        leaveRmCachePage: item.leaveRmCachePage
      },
      children: item.children.length === 0 ? [] : generateRoutersByMenus(item.children, `${path}/`)
    }
  })
}

//过滤异步路由
export function filterAsyncRouter(menus: MenuRaw[]) {
  const basicStore = useBasicStore()
  // const accessRoutes: RouterTypes = []
  const asyncRoutes: RouterTypes = generateRoutersByMenus(menus, '/')
  // const permissionMode = basicStore.settings?.permissionMode
  // if (permissionMode === 'rbac') {
  //   accessRoutes = filterAsyncRoutesByMenuList(menuList) //by menuList
  // } else if (permissionMode === 'roles') {
  //   accessRoutes = filterAsyncRoutesByRoles(roleCodeRoutes, roles) //by roles
  // } else {
  //   accessRoutes = filterAsyncRouterByCodes(roleCodeRoutes, codes) //by codes
  // }
  // accessRoutes.forEach((route) => router.addRoute(route))//后续看情况再启用
  asyncRoutes.forEach((item) => router.addRoute(item))
  basicStore.setFilterAsyncRoutes(asyncRoutes)
}
//重置路由
export function resetRouter() {
  //移除之前存在的路由
  const routeNameSet: Set<RouteRecordName> = new Set()
  router.getRoutes().forEach((fItem) => {
    if (fItem.name) routeNameSet.add(fItem.name)
  })
  routeNameSet.forEach((setItem) => router.removeRoute(setItem))
  //新增constantRoutes
  constantRoutes.forEach((feItem) => router.addRoute(feItem))
}
//重置登录状态
export function resetState() {
  resetRouter()
  useBasicStore().resetState()
}

//刷新路由
export function freshRouter(data) {
  resetRouter()
  filterAsyncRouter(data)
  // location.reload()
}

NProgress.configure({ showSpinner: false })
//开始进度条
export const progressStart = () => {
  NProgress.start()
}
//关闭进度条
export const progressClose = () => {
  NProgress.done()
}
