<script setup lang="ts">
import type { GoodType } from '@/types/good'

import { Delete, Lock, Search, Unlock } from '@element-plus/icons-vue'
import moment from 'moment-mini'
import { deletePostReq, getPostToPaginationReq, setPostStatusReq } from '@/api/community/post'
import { enumToObjArr } from '@/utils/common-util'
import { PostStatus } from '@/types/enums'
import { ElMessage, ElMessageBox } from 'element-plus'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL

const pagination = reactive({
  page: 1,
  count: 10,
  total: 0,
  search: '',
  status: 0
})

const postList = ref<GoodType[]>([])

const postStatus = ref<{ id: number; name: string }[]>([])

const splicingUrl = (urls: string[]) => urls.map((url) => `${BASE_URL}/${url}`)

const getTagType = (status: string) => {
  switch (status) {
    case '已发布':
      return 'success'
    case '已屏蔽':
      return 'danger'
    default:
      return 'warning'
  }
}

const getPostList = () => {
  const { status } = pagination
  getPostToPaginationReq({ ...pagination, status: status != 0 ? status : null }).then((res: any) => {
    const { total, data } = res
    pagination.total = total
    postList.value = data
  })
}

const handleCurrentChange = (index) => {
  pagination.page = index
  pagination.search = ''
  getPostList()
}

const onSearchClick = () => {
  pagination.page = 1
  getPostList()
}

const onSelectChange = () => {
  pagination.page = 1
  getPostList()
}

const onSetStatusClick = (id: number, enable: boolean) => {
  ElMessageBox.confirm(enable ? '是否解除屏蔽?' : '是否屏蔽', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    setPostStatusReq(id, enable ? PostStatus.已发布 : PostStatus.已屏蔽).then((_) => {
      ElMessage({
        type: 'success',
        message: `${enable ? '解除屏蔽?' : '屏蔽'}成功`
      })
      getPostList()
    })
  })
}

const onDeleteGoodClick = (id: number) => {
  ElMessageBox.confirm('是否删除该条数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deletePostReq(id).then((_) => {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      getPostList()
    })
  })
}

onMounted(() => {
  getPostList()
  postStatus.value = enumToObjArr(PostStatus)
})
</script>
<template>
  <div class="good h-full">
    <div class="w-150 flex gap-2 mb2 items-center">
      <el-input v-model="pagination.search" placeholder="请输入内容" clearable @keyup.enter="onSearchClick" />
      <el-select v-model="pagination.status" @change="onSelectChange">
        <el-option v-for="item in postStatus" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button class="mb2" type="primary" plain :icon="Search" @click="onSearchClick">查询</el-button>
    </div>
    <el-table :data="postList" style="width: 100%" height="90%" border>
      <el-table-column prop="text" label="物品描述" align="center">
        <template #default="scope">
          <el-popover placement="right" title="详情" :width="300" trigger="hover" :content="scope.row.text">
            <template #reference>
              <div class="over-line">
                {{ scope.row.text }}
              </div>
            </template>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="imgUrls" label="帖子图片" align="center">
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
      <el-table-column prop="publbish" label="发帖者" align="center">
        <template #default="scope">
          <div class="flex items-center gap-2 justify-center">
            <img
              v-if="scope.row.publisher"
              class="h8 w8 rounded-4"
              :src="`${BASE_URL}/${scope.row.publisher.avatarUrl}`"
            />
            {{ scope.row.publisher.name }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="likes" label="获赞量" align="center" />
      <el-table-column prop="collects" label="收藏量" align="center" />
      <el-table-column prop="status" label="状态" align="center">
        <template #default="scope">
          <el-tag :type="getTagType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="发帖时间" align="center">
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
            :type="scope.row.status == '已屏蔽' ? 'success' : 'warning'"
            :icon="scope.row.status == '已屏蔽' ? Unlock : Lock"
            plain
            circle
            @click="onSetStatusClick(scope.row.id, scope.row.status == '已屏蔽')"
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
