export interface RoleType {
  id: number
  name: string
  menuIds: number[]
}

export interface AddRoleModel {
  name: string
  menuIds: number[]
}
