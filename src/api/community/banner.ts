export const getBannerListReq = (isApplied: boolean) => httpGet('/Banner/GetAllBannerList', { isApplied })

export const addBannerReq = (data: { imgUrl: string; apply: boolean; order: number }) =>
  httpPost('/Banner/AddBannerList', data)

export const updateBannerReq = (data: { id: number; imgUrl: string; apply: boolean; order: number }) =>
  httpPost('/Banner/UpdateBannerList', data)

export const deleteBannerReq = (id: number) => httpPostByParams('/Banner/DeleteBannerList', { id })
