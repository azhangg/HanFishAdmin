<template>
  <div class="login-container columnCC">
    <el-form ref="refLoginForm" class="login-form" :model="subForm" :rules="formRules">
      <div class="title-container">
        <h3 class="title text-center">{{ settings.title }}</h3>
      </div>
      <el-form-item prop="userName" :rules="formRules.isNotNull('用户名不能为空')">
        <div class="rowSC flex-1">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input v-model="subForm.userName" placeholder="请输入用户名" />
          <!--占位-->
          <div class="show-pwd" />
        </div>
      </el-form-item>
      <!--<el-form-item prop="password" :rules="formRules.passwordValid">-->
      <el-form-item prop="password" :rules="formRules.isNotNull('密码不能为空')">
        <div class="rowSC flex-1">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :key="passwordType"
            ref="refPassword"
            v-model="subForm.password"
            :type="passwordType"
            name="password"
            placeholder="请输入密码"
            @keyup.enter="handleLogin"
          />
          <span class="show-pwd" @click="showPwd">
            <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
          </span>
        </div>
      </el-form-item>
      <div class="px-3 flex justify-between">
        <el-checkbox v-model="rememberMe" label="请记住我" size="large" />
        <el-link :underline="false" @click="registerDialogVisible = true">注册账号</el-link>
      </div>
      <div class="tip-message">{{ tipMessage }}</div>
      <el-button :loading="subLoading" type="primary" class="login-btn" size="default" @click.prevent="handleLogin">
        登录
      </el-button>
    </el-form>

    <el-dialog v-model="registerDialogVisible" title="注册账号" width="30%" center class="register-dialog">
      <el-form ref="refLoginForm" class="flex-1" :model="subForm" :rules="formRules">
        <el-form-item prop="userName" :rules="formRules.isNotNull('用户名不能为空')">
          <div class="rowSC flex-1">
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input v-model="subForm.userName" placeholder="请输入用户名" />
          </div>
        </el-form-item>
        <el-form-item prop="password" :rules="formRules.isNotNull('密码不能为空')">
          <div class="rowSC flex-1">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :key="passwordType"
              ref="refPassword"
              v-model="subForm.password"
              :type="passwordType"
              name="password"
              placeholder="请输入密码"
              @keyup.enter="handleRegister"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="registerDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRegister">注册</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBasicStore } from '@/store/basic'
import { elMessage, useElement } from '@/hooks/use-element'
import { loginReq, registerReq } from '@/api/account'
import { getUserInfoReq } from '@/api/user'
import { clearObject } from '@/utils/common-util'
import { getUserMenusReq } from '@/api/menu'
import { freshRouter } from '@/hooks/use-permission'

/* listen router change and set the query  */
const { settings } = useBasicStore()
//element valid
const formRules = useElement().formRules
//form
const subForm = reactive({
  userName: '',
  password: ''
})
const state: any = reactive({
  otherQuery: {},
  redirect: ''
})

const rememberMe = ref(false)
const registerDialogVisible = ref(false)

const sessionData = localStorage.getItem('pwdGroup')

if (sessionData) {
  const pwdGroup = JSON.parse(sessionData)
  const { userName, password } = pwdGroup
  subForm.userName = userName
  subForm.password = password
  rememberMe.value = true
}

const route = useRoute()
const getOtherQuery = (query) => {
  return Object.keys(query).reduce((acc, cur) => {
    if (cur !== 'redirect') {
      acc[cur] = query[cur]
    }
    return acc
  }, {})
}
watch(
  () => route.query,
  (query) => {
    if (query) {
      state.redirect = query.redirect
      state.otherQuery = getOtherQuery(query)
    }
  },
  { immediate: true }
)

/*
 *  login relative
 * */
const subLoading = ref(false)
//tip message
const tipMessage = ref()
//sub form
const refLoginForm = ref()
const handleLogin = () => {
  refLoginForm.value.validate((valid) => {
    if (valid) {
      subLoading.value = true
      loginFunc()
    }
  })
}

const handleRegister = () => {
  refLoginForm.value.validate((valid) => {
    if (valid) {
      registerFunc()
    }
  })
}

const router = useRouter()
const basicStore = useBasicStore()

const loginFunc = () => {
  loginReq(subForm)
    .then((data: any) => {
      basicStore.setToken(data)
      if (rememberMe.value) localStorage.setItem('pwdGroup', JSON.stringify(subForm))
      elMessage('登录成功')
      getUserInfoReq().then((res: any) => {
        basicStore.setUserInfo(res)
      })
      getUserMenusReq().then((res: any) => {
        basicStore.setAsyncMenus(res)
        freshRouter(res)
        router.push('/')
      })
    })
    .catch((err) => {
      tipMessage.value = err?.msg
    })
    .finally(() => {
      subLoading.value = false
    })
}

const registerFunc = () => {
  registerReq(subForm).then((data: any) => {
    clearObject(subForm)
    registerDialogVisible.value = false
    elMessage('注册成功')
  })
}
/*
 *  password show or hidden
 * */
const passwordType = ref('password')
const refPassword: any = ref(null)
const showPwd = () => {
  if (passwordType.value === 'password') {
    passwordType.value = ''
  } else {
    passwordType.value = 'password'
  }
  nextTick(() => {
    refPassword.value.focus()
  })
}
</script>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;
.login-container {
  height: 100vh;
  width: 100%;
  background-image: url('@/assets/images/background_login_2.jpg');
  background-size: 100% 100%;
  .login-form {
    margin-bottom: 20vh;
    width: 360px;
  }
  .title-container {
    .title {
      font-size: 22px;
      color: #eee;
      margin: 0 auto 25px auto;
      text-align: center;
      font-weight: bold;
    }
  }
}

.svg-container {
  padding-left: 6px;
  color: $dark_gray;
  text-align: center;
  width: 30px;
}

//错误提示信息
.tip-message {
  color: #e4393c;
  height: 30px;
  margin-top: -12px;
  font-size: 12px;
}
//登录按钮
.login-btn {
  width: 100%;
  margin-bottom: 30px;
}
.show-pwd {
  width: 50px;
  font-size: 16px;
  color: $dark_gray;
  cursor: pointer;
  text-align: center;
}
</style>

<style lang="scss">
//css 样式重置 增加个前缀避免全局污染
.login-container {
  .el-checkbox,
  .el-link {
    color: white;
  }
  .el-link:hover {
    color: var(--el-color-primary);
  }
  .el-input__wrapper {
    background-color: transparent;
    box-shadow: none;
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.3);
    border-radius: 5px;
    color: #454545;
  }
  .el-input input {
    background: transparent;
    border: 0px;
    border-radius: 0px;
    padding: 10px 5px 10px 15px;
    color: #fff;
    height: 42px; //此处调整item的高度
    caret-color: #fff;
  }
  //hiden the input border
  .el-input__inner {
    box-shadow: none !important;
  }
  .register-dialog {
    .el-form-item {
      background: rgba(255, 255, 255, 0.5) !important;
    }
    .el-input {
      border: 1px solid var(--el-input-hover-border-color);
      border-radius: 5px;
      & input {
        color: black;
        caret-color: black;
      }
      &__wrapper:hover {
        box-shadow: none;
      }
    }
  }
}
</style>
