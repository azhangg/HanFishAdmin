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

<template>
  <div class="home">
    <div>首页</div>
  </div>
</template>
