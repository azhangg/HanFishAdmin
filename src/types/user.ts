export interface UserType {
  id: number
  name: string
  loginName: string
  avatarUrl?: string
  email?: string
  roleId: number
  createTime: string
}

export interface AddUserModel {
  name: string
  email?: string
  loginName: string
  password: string
  avatarUrl?: string
  roleId: number
}

export interface UpdateUserModel {
  id: number
  name: string
  email?: string
  avatarUrl?: string
}

export interface ReqUsersToPaginationModel {
  searchText?: string
  page: number
  count: number
}
