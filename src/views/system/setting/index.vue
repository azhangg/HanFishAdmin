<template>
  <div class="scroll-y">
    <div v-lang class="mt-10px mb-10px font-bold">切换主题</div>
    <el-button @click="setTheme('base-theme')">默认</el-button>
    <el-button @click="setTheme('lighting-theme')">明亮</el-button>
    <el-button @click="setTheme('china-red')">中国红</el-button>
    <el-button @click="setTheme('dark')">深色</el-button>

    <div v-lang class="mt-10px mb-10px font-bold">切换尺寸</div>
    <el-button @click="setSize('large')">大</el-button>
    <el-button @click="setSize('default')">默认</el-button>
    <el-button @click="setSize('small')">小</el-button>

    <div v-lang class="mt-10px mb-10px font-bold">switch language</div>
    <!-- <el-button @click="changeLanguage('en')" disabled>en</el-button> -->
    <el-button @click="changeLanguage('zh')">zh</el-button>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useConfigStore } from '@/store/config'

const { setTheme, theme, setSize, size, setLanguage } = useConfigStore()
const route = useRoute()
const changeLanguage = (langParam) => {
  setLanguage(langParam, route.meta?.title)
}

onMounted(() => {})
const count = ref(0)
const showObj = ref(GLOBAL_VAR)
</script>
