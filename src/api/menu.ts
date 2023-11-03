import { httpGet } from '@/utils/axios-req'

export const getUserMenus = () => httpGet('/Menu/GetUserMenus')
