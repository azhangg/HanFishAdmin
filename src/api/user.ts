import { ReqUsersToPaginationModel, UpdateUserModel } from '@/types/user'
import { httpPost, httpPostByParams } from '@/utils/axios-req'

export const getUserToPaginationReq = (params: ReqUsersToPaginationModel) =>
  httpGet('/User/GetUsersToPagination', params)

export const updateUserReq = (user: UpdateUserModel) => httpPost('/User/UpdateUser', user)

export const deleteUserReq = (id: number) => httpPostByParams('/User/DeleteUser', { id })
