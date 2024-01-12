export enum OperationType {
  添加,
  修改
}

export enum GoodStatus {
  未交易 = 1,
  已交易 = 2,
  违规 = 3,
  已下架 = 4
}

export enum OrderStatus {
  待付款 = 1,
  待发货 = 2,
  待收货 = 3,
  待评价 = 4,
  已完成 = 5,
  已取消 = 6
}

export enum PostStatus {
  已发布 = 1,
  已屏蔽 = 2
}
