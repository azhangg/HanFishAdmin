export const getOrderToPaginationReq = (data: { page: number; count: number; search: string; status: number }) =>
  httpGet('/Order/GetOrdersToPagination', data)

export const deleteOrderReq = (id: number) => httpPost('/Order/DeleteOrder', { id })
