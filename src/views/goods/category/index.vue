<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import { ElInput, ElMessage, ElMessageBox } from 'element-plus'
import {
  addGoodCategoryReq,
  deleteGoodCategoryReq,
  getGoodCategoriesReq,
  updateGoodCategoryReq
} from '@/api/goods/goodCategory'

export interface GoodCategory {
  id: number
  name: string
}

const inputValue = ref('')
const updateName = ref('')
const goodCategories = ref<GoodCategory[]>([])
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (category: GoodCategory) => {
  ElMessageBox.confirm('是否删除该分类?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteGoodCategoryReq(category.id).then((_) => {
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      getGoodCategories()
    })
  })
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    addGoodCategoryReq(inputValue.value).then((_: any) => {
      elMessage('添加成功')
      getGoodCategories()
    })
  }
  inputVisible.value = false
  inputValue.value = ''
}

const getGoodCategories = () => {
  getGoodCategoriesReq().then((res: any) => {
    goodCategories.value = res
  })
}

const onUpdateCategory = (id: number) => {
  if (updateName.value)
    updateGoodCategoryReq(id, updateName.value).then((_) => {
      elMessage('修改成功')
      getGoodCategories()
    })
  else
    ElMessage({
      type: 'warning',
      message: '分类名称不能为空'
    })
}

onMounted(() => {
  getGoodCategories()
})
</script>
<template>
  <div class="good h-full w-full">
    <el-popover v-for="category in goodCategories" :key="category.id" placement="bottom" :width="100" trigger="click">
      <template #default>
        <el-input v-model="updateName" class="w-20" clearable @keyup.enter="onUpdateCategory(category.id)" />
      </template>
      <template #reference>
        <el-tag
          class="mx-1"
          closable
          size="large"
          type="warning"
          effect="plain"
          :disable-transitions="false"
          @click="updateName = category.name"
          @close="handleClose(category)"
        >
          {{ category.name }}
        </el-tag>
      </template>
    </el-popover>

    <el-input
      v-if="inputVisible"
      ref="InputRef"
      v-model="inputValue"
      class="ml-1 w-20"
      clearable
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <el-button v-else class="button-new-tag ml-1" @click="showInput">+ 新建分类</el-button>
  </div>
</template>
<style lang="scss" scoped>
.el-input {
  width: 8rem;
}
</style>
