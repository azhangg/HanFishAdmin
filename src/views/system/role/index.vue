<script setup lang="ts">
import type { RoleType } from '@/types/role'
import type { MenuRaw } from '@/types/menu'
import { ElTree, FormRules, FormInstance, ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'

import { getRolesReq, updateRoleReq, addRoleReq, deleteRoleReq } from '@/api/role'
import { getAllMenusReq } from '@/api/menu'
import { clearObject } from '@/utils/common-util'
import { OperationType } from '@/types/enums'

const treeRef = ref<InstanceType<typeof ElTree>>()
const roleFormRef = ref<FormInstance>()

const roleRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
})

const roleList = ref<RoleType[]>([])
const menuList = ref<MenuRaw[]>([])

const roleDialogVisible = ref(false)
const operation = ref(OperationType.添加)

const role = reactive<RoleType>({
  id: 0,
  name: '',
  menuIds: []
})

const getRoles = () => {
  getRolesReq().then((res: any) => {
    roleList.value = res
  })
}

const getMenus = () => {
  getAllMenusReq().then((res: any) => {
    menuList.value = res
  })
}

const filterMenus = (menuIds: number[], menus: MenuRaw[]) => {
  if (menus.length == 0) return []
  return menus
    .filter((m) => menuIds.includes(m.id))
    .map((menu) => {
      return { ...menu, children: filterMenus(menuIds, menu.children) }
    })
}

const filterSonKeysOnMenus = (ids: number[]) => {
  let keys: number[] = []
  const pushIds = (id: number, menus: MenuRaw[]) => {
    if (menus.length == 0) return
    menus.forEach((menu) => {
      if (menu.id === id) {
        if (menu.children.length === 0) keys.push(id)
      }
      pushIds(id, menu.children)
    })
  }
  ids.forEach((id) => {
    pushIds(id, menuList.value)
  })
  return keys
}

const onAddRoleClick = () => {
  clearObject(role)
  treeRef?.value?.setCheckedKeys([])
  roleDialogVisible.value = true
}

const onEditRoleClick = (row: RoleType) => {
  role.id = row.id
  role.name = row.name
  role.menuIds = row.menuIds
  operation.value = OperationType.修改
  roleDialogVisible.value = true
  nextTick(() => {
    treeRef?.value?.setCheckedKeys(filterSonKeysOnMenus(role.menuIds), true)
  })
}

const operationHandler = () => {
  roleFormRef.value?.validate((valid) => {
    if (valid) {
      role.menuIds = treeRef?.value?.getCheckedNodes(false, true).map((node) => node.id) ?? []
      const isAdd = operation.value == OperationType.添加
      const result = isAdd ? addRoleReq(role) : updateRoleReq(role)
      result.then((_) => {
        ElMessage({
          type: 'success',
          message: isAdd ? '添加成功' : '保存成功'
        })
        getRoles()
        roleDialogVisible.value = false
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
    deleteRoleReq(id).then((_) => {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      getRoles()
    })
  })
}

onMounted(() => {
  getRoles()
  getMenus()
})
</script>
<template>
  <div class="role h-full">
    <el-button class="mb2" type="warning" plain :icon="Plus" @click="onAddRoleClick">添加角色</el-button>
    <el-table :data="roleList" style="width: 100%" height="95%" border>
      <el-table-column prop="name" label="名称" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.id === 1" size="large" class="ml-2" type="danger">{{ scope.row.name }}</el-tag>
          <el-tag v-else-if="scope.row.id === 2" size="large" class="ml-2" type="warning">{{ scope.row.name }}</el-tag>
          <el-tag v-else-if="scope.row.id === 3" size="large" class="ml-2" type="success">{{ scope.row.name }}</el-tag>
          <el-tag v-else size="large" class="ml-2" type="info">{{ scope.row.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="menuIds" label="菜单权限" align="center">
        <template #default="scope">
          <span v-if="scope.row.menuIds.length == 0">无</span>
          <el-tree
            v-else
            :data="filterMenus(scope.row.menuIds, menuList)"
            :props="{ children: 'children', label: 'title' }"
            node-key="id"
            default-expand-all
          >
            <template #default="{ node, data }">
              <el-tag class="ml-2" type="info">{{ data.title }}</el-tag>
            </template>
          </el-tree>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="primary" plain :icon="Edit" circle @click="onEditRoleClick(scope.row)" />
          <el-button type="danger" plain :icon="Delete" circle @click="onDeleteMenuClick(scope.row.id)" />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="roleDialogVisible"
      :open-delay="100"
      :title="operation == OperationType.添加 ? '添加角色' : '修改角色'"
    >
      <el-form ref="roleFormRef" :model="role" :rules="roleRules">
        <el-form-item label="名称" prop="name" label-width="10%">
          <el-input v-model="role.name" clearable />
        </el-form-item>
        <el-form-item label="菜单权限" prop="menuIds" label-width="10%">
          <el-tree
            ref="treeRef"
            :data="menuList"
            show-checkbox
            highlight-current
            :props="{ children: 'children', label: 'title' }"
            node-key="id"
            default-expand-all
          >
            <template #default="{ node, data }">
              <el-tag class="ml-2" type="info">{{ data.title }}</el-tag>
            </template>
          </el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="operationHandler">
            {{ operation == OperationType.添加 ? '添加' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped></style>
