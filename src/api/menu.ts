import type { AddMenuModel, UpdateMenuModel } from '@/types/menu'

import { httpGet } from '@/utils/axios-req'

export const getUserMenusReq = () => httpGet('/Menu/GetUserMenus')

export const getAllMenusReq = () => httpGet('/Menu/GetAllMenus')

export const addMenuReq = (menu: AddMenuModel) => httpPost('/Menu/AddMenu', menu)

export const updateMenuReq = (menu: UpdateMenuModel) => httpPost('/Menu/UpdateMenu', menu)

export const deleteMenuReq = (id: number) => httpPostByParams('/Menu/DeleteMenu', { id })
