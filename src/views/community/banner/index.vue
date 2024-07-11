<script setup lang="ts">
import type { Menu, MenuRaw } from '@/types/menu'
import type { UploadProps } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OperationType } from '@/types/enums'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { addBannerReq, deleteBannerReq, getBannerListReq, updateBannerReq } from '@/api/community/banner'

import { useBasicStore } from '@/store/basic'

const { token } = useBasicStore()

const BASE_URL = import.meta.env.VITE_APP_BASE_URL

const isApplied = ref(false)

const bannerList = ref<
  {
    id: number
    imgUrl?: string
    apply: boolean
    order: number
    createTime: Date
  }[]
>([])

const bannerDialogVisible = ref(false)

const operation = ref(OperationType.添加)

const banner = reactive({
  id: 0,
  imgUrl: '',
  apply: false,
  order: 0
})

const menu = reactive<Menu>({
  id: 0,
  name: '',
  title: '',
  hidden: false,
  icon: '',
  affix: false,
  redirect: '',
  order: 0,
  pId: null,
  createTime: ''
})

const getAllBanner = () => {
  getBannerListReq(isApplied.value).then((res: any) => {
    bannerList.value = res
  })
}

const openAddBannerDialog = () => {
  ;(banner.id = 0), (banner.imgUrl = ''), (banner.apply = false), (banner.order = 0), (bannerDialogVisible.value = true)
  operation.value = OperationType.添加
}

const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  const { isSuccess, data } = response
  if (isSuccess && data.length > 0) {
    banner.imgUrl = data[0]
  }
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const typeList = ['image/jpeg', 'image/jpg', 'image/png']
  if (!typeList.includes(rawFile.type)) {
    ElMessage.error('只能上传jpeg、jpg、png三种格式的图片')
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('最大只能上传10M以下的图片')
    return false
  }
  return true
}

const openEditBannerDialog = (row: typeof banner) => {
  banner.id = row.id
  banner.imgUrl = row.imgUrl
  banner.apply = row.apply
  banner.order = row.order
  bannerDialogVisible.value = true
  operation.value = OperationType.修改
}

const onOperationClick = () => {
  if (!banner.imgUrl) {
    ElMessage({
      type: 'warning',
      message: '请选择图片'
    })
    return
  }
  const isAdd = operation.value == OperationType.添加
  const result = isAdd ? addBannerReq(banner) : updateBannerReq(banner)
  result.then((_) => {
    ElMessage({
      type: 'success',
      message: isAdd ? '添加成功' : '保存成功'
    })
    getAllBanner()
    bannerDialogVisible.value = false
  })
}

const onDeleteBannerClick = (id: number) => {
  ElMessageBox.confirm('是否删除该条数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteBannerReq(id).then((_) => {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      getAllBanner()
    })
  })
}

onMounted(() => {
  getAllBanner()
})
</script>

<template>
  <div class="banner h-full">
    <el-button class="mb2" type="success" plain :icon="Plus" @click="openAddBannerDialog()">添加轮播图</el-button>
    <el-button class="mb2" type="primary" plain @click="getAllBanner()">刷新</el-button>
    <el-checkbox v-model="isApplied" class="ml-2 mb2" label="" />
    <text class="ml-2 mb-2">{{ `${isApplied ? '查询已应用' : '查询全部'}` }}</text>
    <el-table :data="bannerList" style="width: 100%" height="95%" row-key="id" border default-expand-all>
      <el-table-column prop="name" label="图片" align="center">
        <template #default="scope">
          <img v-if="scope.row.imgUrl" class="w-full h-50" :src="`${BASE_URL}/${scope.row.imgUrl}`" />
        </template>
      </el-table-column>
      <el-table-column prop="apply" label="是否应用" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.apply" class="ml-2">是</el-tag>
          <el-tag v-else class="ml-2" type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="order" label="排序" align="center" />
      <el-table-column label="操作" align="center" width="200px">
        <template #default="scope">
          <el-button type="primary" plain :icon="Edit" circle @click="openEditBannerDialog(scope.row)" />
          <el-button type="danger" plain :icon="Delete" circle @click="onDeleteBannerClick(scope.row.id)" />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="bannerDialogVisible" :title="operation != OperationType.添加 ? '修改轮播图' : '添加轮播图'">
      <el-form :model="banner">
        <el-form-item label="选择图片" prop="imgUrl" label-width="100px">
          <el-upload
            class="avatar-uploader"
            :action="`${BASE_URL}/api/Files/UploadFile`"
            :show-file-list="false"
            :headers="{
              Authorization: `${token.tokenType} ${token.accessToken}`
            }"
            name="formFile"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="banner.imgUrl" :src="`${BASE_URL}/${banner.imgUrl}`" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon shadow"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="配置" label-width="100px">
          <el-checkbox v-model="banner.apply" label="应用" />
        </el-form-item>
        <el-form-item label="排序" label-width="100px">
          <el-input-number v-model="banner.order" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="bannerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onOperationClick">
            {{ operation == OperationType.添加 ? '添加' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.banner {
  .avatar-uploader .el-upload {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
  }

  .avatar-uploader .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }

  .avatar-uploader .el-upload:hover {
    border-color: var(--el-color-primary);
  }

  .el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
  }
}
</style>
