import type { RouteRawConfig } from '@/types/router'
import type { MenuRaw } from '@/types/menu'

import { createRouter, createWebHistory } from 'vue-router'
import basicDemo from './modules/dynamic-router'
import type { RouterTypes } from '~/basic'
import Layout from '@/layout/index.vue'

const Page404 = import('@/views/error-page/404.vue')
const Page401 = import('@/views/error-page/401.vue')

const viewModules = import.meta.glob('@/views/**/*.vue', { eager: true })

const asyncMenus: MenuRaw[] = JSON.parse(localStorage.getItem('basic') ?? '')?.asyncMenus ?? []

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
const generateRoutersByMenus = (menus: MenuRaw[], basePath: string) => {
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

const DynamicRouter: RouteRawConfig[] = generateRoutersByMenus(asyncMenus, '/')

export const constantRoutes: RouterTypes = [
  {
    name: 'Redirect',
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        name: ':Path(.*)',
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect')
      }
    ]
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    hidden: true
  },
  {
    name: '404',
    path: '/404',
    component: () => import('@/views/error-page/404.vue'),
    hidden: true
  },
  {
    name: '401',
    path: '/401',
    component: () => import('@/views/error-page/401.vue'),
    hidden: true
  },
  {
    name: 'Layout',
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        //using el svg icon, the elSvgIcon first when at the same time using elSvgIcon and icon
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  },
  // {
  //   name: 'Setting-Switch',
  //   path: '/setting-switch',
  //   component: Layout,
  //   alwaysShow: true,
  //   meta: { title: 'Setting Switch', elSvgIcon: 'Setting' },
  //   children: [
  //     {
  //       path: 'index',
  //       component: () => import('@/views/setting-switch/index.vue'),
  //       name: 'SettingSwitch',
  //       meta: { title: 'Setting Switch', elSvgIcon: 'Setting' }
  //     }
  //   ]
  // },
  // {
  //   path: '/nested',
  //   component: Layout,
  //   redirect: '/nested/menu1',
  //   name: 'Nested',
  //   meta: {
  //     title: 'Nested',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: 'menu1',
  //       component: () => import('@/views/nested/menu1/index.vue'), // Parent router-view
  //       name: 'Menu1',
  //       meta: { title: 'Menu1' },
  //       children: [
  //         {
  //           path: 'menu1-1',
  //           component: () => import('@/views/nested/menu1/menu1-1/index.vue'),
  //           name: 'Menu1-1',
  //           meta: { title: 'Menu1-1' }
  //         },
  //         {
  //           path: 'menu1-2',
  //           component: () => import('@/views/nested/menu1/menu1-2/index.vue'),
  //           name: 'Menu1-2',
  //           meta: { title: 'Menu1-2' },
  //           children: [
  //             {
  //               path: 'menu1-2-1',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1/index.vue'),
  //               name: 'Menu1-2-1',
  //               meta: { title: 'Menu1-2-1' }
  //             },
  //             {
  //               path: 'menu1-2-2',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2/index.vue'),
  //               name: 'Menu1-2-2',
  //               meta: { title: 'Menu1-2-2' }
  //             }
  //           ]
  //         },
  //         {
  //           path: 'menu1-3',
  //           component: () => import('@/views/nested/menu1/menu1-3/index.vue'),
  //           name: 'Menu1-3',
  //           meta: { title: 'Menu1-3' }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'menu2',
  //       component: () => import('@/views/nested/menu2/index.vue'),
  //       name: 'Menu2',
  //       meta: { title: 'menu2' }
  //     }
  //   ]
  // },
  // basicDemo,
  ...DynamicRouter,
  { name: ':PathMatch(.*)', path: '/:pathMatch(.*)', redirect: '/404', hidden: true }
]

//角色和code数组动态路由
export const roleCodeRoutes: RouterTypes = []
/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes: RouterTypes = [
  // 404 page must be placed at the end !!!
]

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: constantRoutes
})

export default router
