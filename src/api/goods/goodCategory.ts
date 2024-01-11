export const getGoodCategoriesReq = () => httpGet('/GoodCategory/GetGoodCategories')

export const addGoodCategoryReq = (name: string) => httpPostByParams('/GoodCategory/AddGoodCategory', { name })

export const updateGoodCategoryReq = (id: number, name: string) =>
  httpPostByParams('/GoodCategory/UpdateGoodCategory', { id, name })

export const deleteGoodCategoryReq = (id: number) => httpPostByParams('/GoodCategory/DeleteGoodCategory', { id })
