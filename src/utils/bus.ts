//bus even
import mitt from 'mitt'
import { refreshTokenReq } from '@/api/account'

const $bus = mitt()

export const interval = setInterval(() => {
  const token = JSON.parse(localStorage.getItem('basic') ?? '')?.token
  if (Date.now() / 1000 > token.expiresIn && token.refreshToken) {
    refreshTokenReq(token.refreshToken).then((res: any) => {
      useBasicStore().setToken(res)
    })
    console.log('刷新token')
  }
}, 10000)

export default $bus
