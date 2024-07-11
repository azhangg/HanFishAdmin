import type { ReqUsersToPaginationModel, UpdateUserModel } from '@/types/user'
import { httpPost, httpPostByParams } from '@/utils/axios-req'

export const getUserToPaginationReq = (params: ReqUsersToPaginationModel) =>
  httpGet('/User/GetUsersToPagination', params)

export const updateUserReq = (user: UpdateUserModel) => httpPost('/User/UpdateUser', user)

export const deleteUserReq = (id: number) => httpPostByParams('/User/DeleteUser', { id })

export const getUserInfoReq = () => httpGet('/User/GetUserInfo')

export const updatePasswordReq = (data: { id: number; password: string }) => httpPost('/User/UpdateUserPassword', data)
