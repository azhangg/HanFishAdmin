<script setup lang="ts">
import type { Menu, MenuRaw } from '@/types/menu'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { OperationType } from '@/types/enums'
import { clearObject } from '@/utils/common-util'
import { CopyDocument, Delete, Edit, Plus } from '@element-plus/icons-vue'
import { addMenuReq, deleteMenuReq, getAllMenusReq, updateMenuReq } from '@/api/menu'

const menuFormRef = ref<FormInstance>()

const menuRules = reactive<FormRules>({
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
})

const menuList = ref<MenuRaw[]>([])

const menuDialogVisible = ref(false)

const operation = ref(OperationType.添加)

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

const getAllMenus = () => {
  getAllMenusReq().then((res: any) => {
    menuList.value = res
  })
}

const tableRowClassName = ({ row, rowIndex }: { row: MenuRaw; rowIndex: number }) => {
  if (row.children.length > 0) {
    return `has-children${Math.round(Math.random() * 360)}`
  }
  return ''
}

const openAddMenuDialog = (pId: number | null) => {
  clearObject(menu)
  menu.pId = pId
  menuDialogVisible.value = true
  operation.value = OperationType.添加
}

const openEditMenuDialog = (row: Menu) => {
  menu.id = row.id
  menu.pId = row.pId
  menu.name = row.name
  menu.title = row.title
  menu.redirect = row.redirect
  menu.hidden = row.hidden
  menu.affix = row.affix
  menu.order = row.order
  menu.icon = row.icon
  menuDialogVisible.value = true
  operation.value = OperationType.修改
}

const onOperationClick = () => {
  menuFormRef.value?.validate((valid) => {
    if (valid) {
      const isAdd = operation.value == OperationType.添加
      const result = isAdd ? addMenuReq(menu) : updateMenuReq(menu)
      result.then((_) => {
        ElMessage({
          type: 'success',
          message: isAdd ? '添加成功' : '保存成功'
        })
        getAllMenus()
        menuDialogVisible.value = false
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
    deleteMenuReq(id).then((_) => {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      getAllMenus()
    })
  })
}

onMounted(() => {
  getAllMenus()
})
</script>

<template>
  <div class="menu h-full">
    <el-button class="mb2" type="warning" plain :icon="CopyDocument" @click="openAddMenuDialog(null)">
      添加目录
    </el-button>
    <el-table
      :data="menuList"
      style="width: 100%"
      height="95%"
      row-key="id"
      border
      :row-class-name="tableRowClassName"
      default-expand-all
    >
      <el-table-column prop="name" label="名称" align="center">
        <template #default="scope">
          <el-tag class="ml-2" type="info">{{ scope.row.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="icon" label="图标" align="center" width="60px">
        <template #default="scope">
          <svg-icon :icon-class="scope.row?.icon" />
        </template>
      </el-table-column>
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column prop="order" label="排序" align="center" />
      <el-table-column prop="redirect" label="重定向" align="center">
        <template #default="scope">
          <el-tag class="ml-2" type="warning">{{ scope.row.redirect }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="affix" label="固定" align="center" width="60px">
        <template #default="scope">
          <el-tag v-if="scope.row?.affix" class="ml-2">是</el-tag>
          <el-tag v-else class="ml-2" type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="hidden" label="隐藏" align="center" width="60px">
        <template #default="scope">
          <el-tag v-if="scope.row?.hidden" class="ml-2">是</el-tag>
          <el-tag v-else class="ml-2" type="info">否</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template #default="scope">
          <div class="flex justify-center items-center">
            <el-icon><timer /></el-icon>
            <span class="ml2">{{ scope.row.createTime }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button type="success" plain :icon="Plus" circle @click="openAddMenuDialog(scope.row.id)" />
          <el-button type="primary" plain :icon="Edit" circle @click="openEditMenuDialog(scope.row)" />
          <el-button
            v-if="scope.row.children.length === 0"
            type="danger"
            plain
            :icon="Delete"
            circle
            @click="onDeleteMenuClick(scope.row.id)"
          />
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="menuDialogVisible" :title="menu.pId ? '子菜单' : '根目录'">
      <el-form ref="menuFormRef" class="grid grid-cols-2 items-center" :inline="true" :model="menu" :rules="menuRules">
        <el-form-item label="名称" prop="name" label-width="30%">
          <el-input v-model="menu.name" />
        </el-form-item>
        <el-form-item label="标题" prop="title" label-width="30%">
          <el-input v-model="menu.title" />
        </el-form-item>
        <el-form-item label="重定向" prop="redirect" label-width="30%">
          <el-input v-model="menu.redirect" />
        </el-form-item>
        <el-form-item label="配置" label-width="30%">
          <el-checkbox v-model="menu.hidden" label="隐藏" />
          <el-checkbox v-model="menu.affix" label="固定" />
        </el-form-item>
        <el-form-item label="排序" label-width="30%">
          <el-input-number v-model="menu.order" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="图标" label-width="30%">
          <svg-icon v-if="menu.icon" :icon-class="menu.icon" />
          <span v-else>无</span>
          <IconSelector v-model="menu.icon" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="menuDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onOperationClick">
            {{ operation == OperationType.添加 ? '添加' : '保存' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss">
@for $i from 0 through 360 {
  .el-table .has-children#{$i} {
    background-color: hsla($i, 50%, 50%, 0.1);
    &:hover {
      background-color: hsla($i, 50%, 50%, 0.1);
    }
  }
}
.el-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell {
  background-color: transparent !important;
}
.el-table__inner-wrapper {
  height: 100% !important;
}
</style>
