<script setup lang="ts">
import type { RoleType } from '@/types/role'
import type { MenuRaw } from '@/types/menu'
import { ElTree } from 'element-plus'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'

import { getRolesReq, updateRoleReq, addRoleReq, deleteRoleReq } from '@/api/role'
import { getAllMenusReq } from '@/api/menu'

const treeRef = ref<InstanceType<typeof ElTree>>()

const roleList = ref<RoleType[]>([])
const menuList = ref<MenuRaw[]>([])

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

onMounted(() => {
  getRoles()
  getMenus()
})
</script>
<template>
  <div class="role h-full">
    <el-button class="mb2" type="warning" plain :icon="Plus" @click="">添加角色</el-button>
    <el-table :data="roleList" style="width: 100%" height="95%" border>
      <el-table-column prop="name" label="名称" align="center">
        <template #default="scope">
          <el-tag size="large" class="ml-2">{{ scope.row.name }}</el-tag>
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
          <el-button type="primary" plain :icon="Edit" circle @click="" />
          <el-button type="danger" plain :icon="Delete" circle @click="" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped></style>
