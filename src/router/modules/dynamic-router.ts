import type { RouteRawConfig } from '@/types/router'
import type { MenuRaw } from '@/types/menu'

const Layout = import('@/layout/index.vue')
const Page404 = import('@/views/error-page/404.vue')
const Page401 = import('@/views/error-page/401.vue')

const viewModules = import.meta.glob('@/views/**/*.vue', { eager: true })

const getPage = (path: string) => {
  for (const view in viewModules) {
    if (view.includes(path)) {
      const component = viewModules[view]
      return new Promise<typeof component>((resolve, _) => {
        resolve(component)
      })
    }
  }
  return Page404
}

const menus: MenuRaw[] = [
  {
    id: 1,
    name: 'Test',
    title: '菜单测试',
    hidden: false,
    pId: null,
    children: [
      {
        id: 2,
        name: 'Test1',
        title: '菜单测试1',
        hidden: false,
        children: [],
        pId: 1
      },
      {
        id: 4,
        name: 'Test3',
        title: '菜单测试3',
        hidden: false,
        children: [],
        pId: 1
      }
    ]
  }
]

const generateRoutersByMenus = (menus: MenuRaw[], basePath: string) => {
  return menus.map<RouteRawConfig>((item) => {
    const path = `${basePath}${item.name.toLowerCase()}`
    return {
      name: item.name,
      path: item.pId == null ? path : item.name.toLowerCase(),
      hidden: item.hidden,
      alwaysShow: item.awalwaysShow,
      redirect: item.redirect,
      component: () => (item.pId ? getPage(path) : Layout),
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

export const DynamicRouter: RouteRawConfig[] = generateRoutersByMenus(menus, '/')

const BasicDemo = {
  path: '/basic-demo',
  component: () => Layout,
  meta: { title: 'Basic Demo', icon: 'eye-open' },
  alwaysShow: true,
  children: [
    {
      path: 'hook',
      component: () => Page404,
      name: 'Hook',
      meta: { title: 'Hook' }
    },
    {
      path: 'pinia',
      component: () => Page401,
      name: 'Pinia',
      meta: { title: 'Pinia' }
    },
    {
      path: 'mock',
      component: () => import('@/views/basic-demo/mock/index.vue'),
      name: 'Mock',
      meta: { title: 'Mock' }
    },
    {
      path: 'svg-icon',
      component: () => import('@/views/basic-demo/svg-icon/index.vue'),
      name: 'SvgIcon',
      meta: { title: 'Svg Icon' }
    },
    {
      path: 'parent-children',
      component: () => import('@/views/basic-demo/parent-children/index.vue'),
      name: 'Parent',
      meta: { title: 'Parent Children' }
    },
    {
      path: 'second-keep-alive',
      component: () => import('@/views/basic-demo/keep-alive/second-keep-alive.vue'),
      name: 'SecondKeepAlive',
      //cachePage: cachePage when page enter, default false
      //leaveRmCachePage: remove cachePage when page leave, default false
      meta: { title: 'Send KeepAlive', cachePage: true, closeTabRmCache: false }
    },
    {
      path: 'keep-alive-group',
      component: () => import('@/views/basic-demo/keep-alive/index.vue'),
      name: 'KeepAliveGroup',
      //cachePage: cachePage when page enter, default false
      //leaveRmCachePage: remove cachePage when page leave, default false
      meta: { title: 'KeepAlive Group', cacheGroup: ['KeepAliveGroup', 'SecondChild', 'ThirdChild'] }
    },
    {
      path: 'second-child',
      name: 'SecondChild',
      hidden: true,
      component: () => import('@/views/basic-demo/keep-alive/second-child.vue'),
      meta: { title: 'SecondChild', activeMenu: '/basic-demo/second-keep-alive' }
    },
    {
      path: 'third-child',
      name: 'ThirdChild',
      hidden: true,
      component: () => import('@/views/basic-demo/keep-alive/third-child.vue'),
      meta: { title: 'ThirdChild', activeMenu: '/basic-demo/second-keep-alive' }
    },
    //tab-keep-alive
    {
      path: 'tab-keep-alive',
      component: () => import('@/views/basic-demo/keep-alive/tab-keep-alive.vue'),
      name: 'TabKeepAlive',
      //closeTabRmCache: remove cachePage when tabs close, default false
      meta: { title: 'Tab KeepAlive', cachePage: true, closeTabRmCache: true }
    },
    {
      path: 'worker',
      component: () => import('@/views/basic-demo/worker/index.vue'),
      name: 'Worker',
      meta: { title: 'Worker' }
    }
  ]
}

export default BasicDemo
