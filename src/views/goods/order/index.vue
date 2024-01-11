<script setup lang="ts">
import type { GoodType } from '@/types/good'

import { Search, Delete } from '@element-plus/icons-vue'
import moment from 'moment-mini'
import { getOrderToPaginationReq, deleteOrderReq } from '@/api/goods/order'
import { enumToObjArr } from '@/utils/common-util'
import { OrderStatus } from '@/types/enums'
import { ElMessageBox, ElMessage } from 'element-plus'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL

const pagination = reactive({
  page: 1,
  count: 10,
  total: 0,
  search: '',
  status: 0
})

const orderList = ref<GoodType[]>([])

const orderStatus = ref<{ id: number; name: string }[]>([])

const splicingUrl = (urls: string[]) => urls.map((url) => `${BASE_URL}/${url}`)

const getTagType = (status: number) => {
  switch (status) {
    case 5:
      return 'success'
    case 6:
      return 'danger'
    default:
      return 'warning'
  }
}

const getOrderList = () => {
  getOrderToPaginationReq(pagination).then((res: any) => {
    const { total, data } = res
    pagination.total = total
    orderList.value = data
  })
}

const handleCurrentChange = (index) => {
  pagination.page = index
  pagination.search = ''
  getOrderList()
}

const onSearchClick = () => {
  pagination.page = 1
  getOrderList()
}

const onDeleteGoodClick = (id: number) => {
  ElMessageBox.confirm('是否删除该条数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteOrderReq(id).then((_) => {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      getOrderList()
    })
  })
}

onMounted(() => {
  getOrderList()
  orderStatus.value = enumToObjArr(OrderStatus)
  orderStatus.value.unshift({ id: 0, name: '全部状态' })
})
</script>
<template>
  <div class="good h-full">
    <div class="w-150 flex gap-2 mb2 items-center">
      <el-input v-model="pagination.search" placeholder="请输入订单编号" clearable @keyup.enter="onSearchClick" />
      <el-select v-model="pagination.status">
        <el-option v-for="item in orderStatus" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button class="mb2" type="primary" plain :icon="Search" @click="onSearchClick">查询</el-button>
    </div>
    <el-table :data="orderList" style="width: 100%" height="90%" border>
      <el-table-column prop="code" label="订单编号" align="center" />
      <el-table-column prop="good" label="物品图片" align="center">
        <template #default="scope">
          <div class="flex items-center gap-2 justify-center">
            <el-image
              v-if="scope.row.good.imgUrls[0]"
              loading="lazy"
              :preview-teleported="true"
              style="width: 100px; height: 100px; border-radius: 0.5rem"
              :src="`${BASE_URL}/${scope.row.good.imgUrls[0]}`"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="splicingUrl(scope.row.good.imgUrls)"
              :initial-index="0"
              fit="cover"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="good" label="物品描述" align="center">
        <template #default="scope">
          <el-popover placement="right" title="详情" :width="300" trigger="hover" :content="scope.row.good.description">
            <template #reference>
              <div class="over-line">
                {{ scope.row.good.description }}
              </div>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="good" label="成交价格" align="center">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <div class="text-red text-6">
              {{ scope.row.good.price }}
            </div>
            <span>&ensp;元</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="user" label="下单者" align="center">
        <template #default="scope">
          <div class="flex items-center gap-2 justify-center">
            <img
              v-if="scope.row.user.avatarUrl"
              class="h8 w8 rounded-4"
              :src="`${BASE_URL}/${scope.row.user.avatarUrl}`"
            />
            {{ scope.row.user.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址信息" align="center">
        <template #default="scope">
          <div class="flex flex-col justify-center items-center">
            <div>{{ scope.row.address.name }}</div>
            <div>{{ scope.row.address.contactNum }}</div>
            <div>{{ scope.row.address.deliveryAddress }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="getTagType(scope.row.status)">
            {{ orderStatus.find((s) => s.id === scope.row.status)?.name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="下单时间" align="center">
        <template #default="scope">
          <div class="flex justify-center items-center">
            <el-icon><timer /></el-icon>
            <span class="ml2">{{ moment(scope.row.createTime).format('YYYY年M月d日 HH:mm:ss') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="80px">
        <template #default="scope">
          <el-button type="danger" plain :icon="Delete" circle @click="onDeleteGoodClick(scope.row.id)" />
        </template>
      </el-table-column>
    </el-table>
    <div class="w-full mt-2 mb-2 flex justify-center">
      <el-pagination
        v-model:current-page="pagination.page"
        :page-size="pagination.count"
        background
        layout="total, prev, pager, next"
        :total="pagination.total"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>
<style lang="scss" scoped>
.good {
  .over-line {
    height: 65px;
    word-break: break-all;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
}
.el-button {
  margin: 0;
}
</style>
