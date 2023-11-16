import type { AddRoleModel, RoleType } from '@/types/role'

export const getRolesReq = () => httpGet('/Role/GetAllRole')

export const addRoleReq = (role: AddRoleModel) => httpPost('/Role/AddRole', role)

export const updateRoleReq = (role: RoleType) => httpPost('/Role/UpdateRole', role)

export const deleteRoleReq = (id: number) => httpPostByParams('/Role/DelateRole', { id })
