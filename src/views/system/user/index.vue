<script setup lang="ts">
import type { RoleType } from '@/types/role'
import { FormRules, FormInstance, ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Search } from '@element-plus/icons-vue'

import { getRolesReq } from '@/api/role'
import { getUserToPaginationReq, updateUserReq, deleteUserReq } from '@/api/user'
import { clearObject } from '@/utils/common-util'
import { OperationType } from '@/types/enums'
import { UserType } from '@/types/user'

const userFormRef = ref<FormInstance>()

const userRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
})

const userList = ref<RoleType[]>([])
const roleList = ref<RoleType[]>([])

const userDialogVisible = ref(false)
const operation = ref(OperationType.添加)

const pagination = reactive({
  searchText: '',
  page: 1,
  count: 10,
  total: 0
})

const user = reactive<{
  id: number
  name: string
  email?: string
  avatarUrl?: string
}>({
  id: 0,
  name: '',
  email: '',
  avatarUrl: ''
})

const getUsers = () => {
  getUserToPaginationReq(pagination).then((res: any) => {
    const { total, data } = res
    pagination.total = total
    userList.value = data
  })
}

const getRoles = () => {
  getRolesReq().then((res: any) => {
    roleList.value = res
  })
}

const handleCurrentChange = (index) => {
  pagination.page = index
  getUsers()
}

const onSearchClick = () => {
  pagination.page = 1
  getUsers()
}

const onEditUserClick = (row: UserType) => {
  user.id = row.id
  user.name = row.name
  user.avatarUrl = row.avatarUrl
  user.email = row.email
  operation.value = OperationType.修改
  userDialogVisible.value = true
}

const operationHandler = () => {
  userFormRef.value?.validate((valid) => {
    if (valid) {
      const isAdd = operation.value == OperationType.添加
      const result = isAdd ? new Promise(() => {}) : updateUserReq(user)
      result.then((_) => {
        ElMessage({
          type: 'success',
          message: isAdd ? '添加成功' : '保存成功'
        })
        getUsers()
        userDialogVisible.value = false
      })
    } else elMessage('请验证输入', 'error')
  })
}

const onDeleteMenuClick = (id: number) => {
  ElMessageBox.confirm('是否删除该条数据?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteUserReq(id).then((_) => {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      getUsers()
    })
  })
}

onMounted(() => {
  getUsers()
  getRoles()
})
</script>
<template>
  <div class="role h-full">
    <div class="w-100 flex gap-2 mb2 items-center">
      <el-input
        v-model="pagination.searchText"
        placeholder="请输入用户账号或名称"
        clearable
        @keyup.enter="onSearchClick"
      />
      <el-button class="mb2" type="primary" plain :icon="Search" @click="onSearchClick">查询</el-button>
    </div>
    <el-table :data="userList" style="width: 100%" height="90%" border>
      <el-table-column prop="name" label="用户名" align="center" />
      <el-table-column prop="loginName" label="账号" align="center" />
      <el-table-column prop="roleId" label="角色" align="center">
        <template #default="scope">
          <el-tag size="large" class="ml-2">{{ roleList.find((r) => r.id === scope.row.roleId)?.name ?? '无' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="email" label="邮箱" align="center" />
      <el-table-column prop="createTime" label="注册时间" align="center">
        <template #default="scope">
          <div class="flex justify-center items-center">
            <el-icon><timer /></el-icon>
            <span class="ml2">{{ scope.row.createTime }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" plain :icon="Edit" circle @click="onEditUserClick(scope.row)" />
          <el-button type="danger" plain :icon="Delete" circle @click="onDeleteMenuClick(scope.row.id)" />
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

    <el-dialog v-model="userDialogVisible" :title="operation == OperationType.添加 ? '添加用户信息' : '修改用户信息'">
      <el-form ref="userFormRef" :model="user" :rules="userRules">
        <el-form-item label="名称" prop="name" label-width="10%">
          <el-input v-model="user.name" clearable />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" label-width="10%">
          <el-input v-model="user.email" clearable />
        </el-form-item>
        <el-form-item label="头像" prop="avatarUrl" label-width="10%">
          <el-input v-model="user.avatarUrl" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="operationHandler">
            {{ operation == OperationType.添加 ? '添加' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.el-button {
  margin: 0;
}
</style>
