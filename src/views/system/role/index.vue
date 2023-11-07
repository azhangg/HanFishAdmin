<script setup lang="ts">
import IconSelector from '@/icons/IconSelector.vue'

const icon = ref('')
</script>
<template>
  <div class="role">
    <IconSelector v-model="icon" />
  </div>
</template>
