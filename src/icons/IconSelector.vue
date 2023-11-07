<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: string; size?: 'small' | 'default' | 'large' }>(), {
  modelValue: 'system',
  size: 'small'
})

const emit = defineEmits<{ (e: 'update:modelValue', modelValue: string) }>()

const { modelValue, size } = toRefs(props)

const files = import.meta.glob('@/icons/**/*.svg')

const icons: string[] = []

const getIconName = () => {
  const regex = /(\w|\-)+?(?=.svg)/g
  for (const key in files) {
    const result = key.match(regex)
    if (result != null && !icons.includes(result?.[0])) icons.push(result?.[0])
  }
}

getIconName()

const handlerIconClick = (icon: string) => {
  emit('update:modelValue', icon)
}
</script>
<template>
  <div class="icon-selector">
    <el-popover placement="bottom-start" :width="200" trigger="click" :hide-after="20">
      <el-scrollbar max-height="128px">
        <div class="grid grid-cols-6 gap-1 max-h-32 pr-3">
          <div
            v-for="item in icons"
            class="flex p1 justify-center items-center"
            :class="{ 'is-active': item == modelValue }"
            @click="handlerIconClick(item)"
          >
            <svg-icon :icon-class="item" />
          </div>
        </div>
      </el-scrollbar>

      <template #reference>
        <el-button class="m-2" :size="size">选择图标</el-button>
      </template>
    </el-popover>
  </div>
</template>
<style lang="scss" scoped>
.is-active {
  background-color: #c6e2ff;
  border-radius: 5px;
}
</style>
