import router from '@/router'
import { generateRoutersByMenus, progressClose, progressStart } from '@/hooks/use-permission'
import { useBasicStore } from '@/store/basic'
import { langTitle } from '@/hooks/use-common'
import settings from '@/settings'

//路由进入前拦截
//to:将要进入的页面 vue-router4.0 不推荐使用next()
export const whiteList = ['/login', '/404', '/401'] // no redirect whitelist
router.beforeEach(async (to) => {
  progressStart()
  document.title = langTitle(to.meta?.title) // i18 page title
  const basicStore = useBasicStore()
  //not login
  if (!settings.isNeedLogin) {
    basicStore.setFilterAsyncRoutes(generateRoutersByMenus(basicStore.asyncMenus, '/'))
    return true
  }

  //1.判断token
  if (basicStore.token.accessToken) {
    if (to.path === '/login') {
      return '/'
    } else {
      basicStore.setFilterAsyncRoutes(generateRoutersByMenus(basicStore.asyncMenus, '/'))
      return true
    }
  } else {
    if (!whiteList.includes(to.path)) {
      return `/login?redirect=${to.path}`
    } else {
      return true
    }
  }
})
//路由进入后拦截
router.afterEach(() => {
  progressClose()
})
