<script setup lang="ts">
import type { GoodType } from '@/types/good'

import { Delete, Lock, Search, Unlock } from '@element-plus/icons-vue'
import moment from 'moment-mini'
import { deleteGoodReq, getGoodListReq, updateGoodStatusReq } from '@/api/goods/good'
import { getGoodCategoriesReq } from '@/api/goods/goodCategory'
import { enumToObjArr } from '@/utils/common-util'
import { GoodStatus } from '@/types/enums'
import { ElMessage, ElMessageBox } from 'element-plus'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL

const pagination = reactive({
  page: 1,
  count: 10,
  total: 0,
  search: '',
  categoryId: 0,
  status: 0
})

const goodList = ref<GoodType[]>([])

const goodCategories = ref<{ id: number; name: string }[]>([])

const goodStatus = ref<{ id: number; name: string }[]>([])

const splicingUrl = (urls: string[]) => urls.map((url) => `${BASE_URL}/${url}`)

const getTagType = (name: string) => {
  switch (name) {
    case '未交易':
      return 'info'
    case '已交易':
      return 'success'
    case '已下架':
      return 'warning'
    case '违规':
      return 'danger'
    default:
      return 'info'
  }
}

const getGoodList = () => {
  getGoodListReq(pagination).then((res: any) => {
    const { total, data } = res
    pagination.total = total
    goodList.value = data
  })
}

const getGoodCategories = () => {
  getGoodCategoriesReq().then((res: any) => {
    goodCategories.value = res
    goodCategories.value.unshift({ id: 0, name: '全部分类' })
  })
}

const handleCurrentChange = (index) => {
  pagination.page = index
  pagination.search = ''
  getGoodList()
}

const onSearchClick = () => {
  pagination.page = 1
  getGoodList()
}

const onSetStatusClick = (id: number, enable: boolean) => {
  ElMessageBox.confirm(enable ? '是否解除屏蔽?' : '是否屏蔽', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    updateGoodStatusReq(id, enable ? GoodStatus.未交易 : GoodStatus.违规).then((_) => {
      ElMessage({
        type: 'success',
        message: `${enable ? '解除屏蔽?' : '屏蔽'}成功`
      })
      getGoodList()
    })
  })
}

const onDeleteGoodClick = (id: number) => {
  ElMessageBox.confirm('是否删除该条数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteGoodReq(id).then((_) => {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      getGoodList()
    })
  })
}

onMounted(() => {
  getGoodList()
  getGoodCategories()
  goodStatus.value = enumToObjArr(GoodStatus)
  goodStatus.value.unshift({ id: 0, name: '全部状态' })
})
</script>
<template>
  <div class="good h-full">
    <div class="w-150 flex gap-2 mb2 items-center">
      <el-input v-model="pagination.search" placeholder="请输入物品描述" clearable @keyup.enter="onSearchClick" />
      <el-select v-model="pagination.categoryId">
        <el-option v-for="item in goodCategories" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-select v-model="pagination.status">
        <el-option v-for="item in goodStatus" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button class="mb2" type="primary" plain :icon="Search" @click="onSearchClick">查询</el-button>
    </div>
    <el-table :data="goodList" style="width: 100%" height="90%" border>
      <el-table-column prop="imgUrls" label="物品图片" align="center">
        <template #default="scope">
          <div class="flex items-center gap-2 justify-center">
            <el-image
              v-if="scope.row.imgUrls[0]"
              loading="lazy"
              :preview-teleported="true"
              style="width: 100px; height: 100px; border-radius: 0.5rem"
              :src="`${BASE_URL}/${scope.row.imgUrls[0]}`"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="splicingUrl(scope.row.imgUrls)"
              :initial-index="0"
              fit="cover"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="物品描述" align="center">
        <template #default="scope">
          <el-popover placement="right" title="详情" :width="300" trigger="hover" :content="scope.row.description">
            <template #reference>
              <div class="over-line">
                {{ scope.row.description }}
              </div>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" align="center">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <div class="text-red text-6">
              {{ scope.row.price }}
            </div>
            <span>&ensp;元</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="user" label="发布者" align="center">
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
      <el-table-column prop="category" label="分类" align="center">
        <template #default="scope">
          <el-tag type="info">{{ scope.row.category.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="getTagType(scope.row.status)">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发布时间" align="center">
        <template #default="scope">
          <div class="flex justify-center items-center">
            <el-icon><timer /></el-icon>
            <span class="ml2">{{ moment(scope.row.createTime).format('YYYY年M月d日 HH:mm:ss') }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button
            v-if="scope.row.status == '违规' || scope.row.status == '未交易'"
            :type="scope.row.status == '违规' ? 'success' : 'warning'"
            :icon="scope.row.status == '违规' ? Unlock : Lock"
            plain
            circle
            @click="onSetStatusClick(scope.row.id, scope.row.status == '违规')"
          />
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
