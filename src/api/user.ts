import { httpPostByParams, httpPost } from '@/utils/axios-req'

//登录
export const loginReq = ({ userName, password }) => {
  return httpPostByParams('/Account/BackendLogin', { userName, password })
}

//注册
export const registerReq = ({ userName, password }) => {
  return httpPost('/Account/RegisterUser', { loginName: userName, password, roleId: 2 })
}
