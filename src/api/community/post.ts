export const getPostToPaginationReq = (data: { page: number; count: number; search: string; status: number | null }) =>
  httpGet('/Post/GetPostListToPagination', data)

export const setPostStatusReq = (id: number, status: number) => httpPost('/Post/SetPostStatus', { id, status })

export const deletePostReq = (id: number) => httpPost('/Post/DeletePost', { id })
