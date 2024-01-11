import { refreshTokenReq } from '@/api/account'

const intervals: { name: string; interval: NodeJS.Timer }[] = []

const addInterval = (name: string, interval: NodeJS.Timer) => intervals.push({ name, interval })

const removeInterval = (name: string) => {
  const index = intervals.findIndex((i) => i.name === name)
  if (index >= 0) {
    clearInterval(intervals[index].interval)
    intervals.splice(index, 1)
  }
}

const clearAllInterval = () => {
  intervals.forEach((interval) => {
    removeInterval(interval.name)
  })
}

export const useInterval = () => {
  addInterval(
    'tokenAutoRefresh',
    setInterval(() => {
      const token = JSON.parse(localStorage.getItem('basic') ?? '')?.token
      if (Date.now() / 1000 > token.expiresIn - 10 && token.refreshToken) {
        refreshTokenReq(token.refreshToken)
          .then((res: any) => {
            console.log('旧令牌', useBasicStore().token)
            useBasicStore().setToken(res)
            console.log('新令牌', useBasicStore().token)
          })
          .catch(() => {
            elMessage('刷新token过期，请重新登录', 'warning')
            useBasicStore().resetStateAndToLogin()
          })
        console.log('刷新token')
      }
    }, 1000)
  )
  return { intervals, removeInterval, clearAllInterval }
}
