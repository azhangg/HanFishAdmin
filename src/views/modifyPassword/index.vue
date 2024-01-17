<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { useBasicStore } from '@/store/basic'
import { updatePasswordReq } from '@/api/user'

const { userInfo, resetStateAndToLogin } = useBasicStore()

const ruleFormRef = ref<FormInstance>()

const rules = reactive<FormRules>({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 3, max: 20, message: '密码长度为3-20', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再输入一次密码', trigger: 'blur' },
    { min: 3, max: 20, message: '密码长度为3-20', trigger: 'blur' }
  ]
})

const ruleForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const onmodifyPasswordClick = () => {
  ruleFormRef.value?.validate((valid) => {
    if (valid) {
      if (ruleForm.newPassword != ruleForm.confirmPassword) {
        elMessage('两次输入的密码不一致', 'error')
        return
      }
      updatePasswordReq({ id: userInfo.id, password: ruleForm.newPassword }).then((_) => {
        elMessage('修改成功，请重新登录')
        setTimeout(() => {
          resetStateAndToLogin()
        }, 1000)
      })
    } else {
      elMessage('请验证输入', 'error')
    }
  })
}
</script>

<template>
  <view class="modifyPassword h-200 w-full flex items-center justify-center">
    <el-card class="w-150" shadow="always">
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-width="120px" class="demo-ruleForm" status-icon>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="ruleForm.newPassword" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="ruleForm.confirmPassword" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onmodifyPasswordClick">修改密码</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </view>
</template>

<style lang="scss"></style>
