import type { RoleType } from '@/types/role'

export const getRolesReq = () => httpGet('/Role/GetAllRole')
