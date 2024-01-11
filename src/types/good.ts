import type { UserType } from '@/types/user'

export interface GoodType {
  id: number
  description: string
  categoryId: number
  category: {
    id: number
    name: string
  }
  createTime: Date
  imgUrls: string[]
  price: number
  status: string
  tags: string[]
  userId: number
  user: UserType
}
