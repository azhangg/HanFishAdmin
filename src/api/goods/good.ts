import { GoodStatus } from '@/types/enums'

export const getGoodListReq = (data: {
  page: number
  count: number
  search: string
  categoryId: number
  status: number
}) => httpGet('/Good/GetGoodToPagination', data)

export const updateGoodStatusReq = (id: number, status: GoodStatus | 0) => httpPost('/Good/UpdateGood', { id, status })

export const deleteGoodReq = (id: number) => httpPost('/Good/DeleteGood', { id })
