<script setup lang="ts">
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { getDataAnalysisReq } from '@/api/dataAnalysis'

const BASE_URL = import.meta.env.VITE_APP_BASE_URL

const dataAnalysis = ref({
  todayDeals: 0,
  todayTransactionAmount: 0,
  todayRegisterNum: 0,
  todayPostPublishNum: 0,
  todayGoodPublishNum: 0,
  totalDeals: 0,
  totalTransactions: 0,
  totalRegisterNum: 0,
  totalPostPublishNum: 0,
  totalGoodPublishNum: 0
})

const connection = new HubConnectionBuilder()
  .withUrl(`${BASE_URL}/hubs/message`, {
    accessTokenFactory: () => useBasicStore().token.accessToken
  })
  .configureLogging(LogLevel.Information)
  .build()

async function start() {
  try {
    await connection.start()
    console.log('SignalR Connected.')
  } catch (err) {
    console.log(err)
    setTimeout(start, 5000)
  }
}

connection.on('ReceiveMessage', (data1, data2) => {
  console.log('连接成功', data1)
})

connection.onclose(async () => {
  await start()
})

const getDataAnalysis = () => {
  getDataAnalysisReq().then((res: any) => {
    dataAnalysis.value = res
  })
}

const pollTimer = setInterval(() => {
  getDataAnalysis()
}, 10000)

onMounted(() => {
  getDataAnalysis()
})

onUnmounted(() => {
  clearInterval(pollTimer)
})
</script>

<template>
  <div class="home">
    <div class="flex flex-col flex-gap-2">
      <div class="grid grid-cols-5 flex-col grid-gap-2">
        <el-card shadow="always">
          今日成交订单量：
          <span class="text-5">{{ dataAnalysis.todayDeals }}</span>
        </el-card>
        <el-card shadow="always">
          今日成交额：
          <span class="text-5">¥&nbsp;{{ dataAnalysis.todayTransactionAmount }}</span>
        </el-card>
        <el-card shadow="always">
          今日新增用户：
          <span class="text-5">{{ dataAnalysis.todayRegisterNum }}</span>
        </el-card>
        <el-card shadow="always">
          今日发布帖子：
          <span class="text-5">{{ dataAnalysis.todayPostPublishNum }}</span>
        </el-card>
        <el-card shadow="always">
          今日发布物品：
          <span class="text-5">{{ dataAnalysis.todayGoodPublishNum }}</span>
        </el-card>

        <el-card shadow="always">
          总成交订单量：
          <span class="text-5">{{ dataAnalysis.totalDeals }}</span>
        </el-card>
        <el-card shadow="always">
          总成交额：
          <span class="text-5">¥&nbsp;{{ dataAnalysis.totalTransactions }}</span>
        </el-card>
        <el-card shadow="always">
          总用户量：
          <span class="text-5">{{ dataAnalysis.totalRegisterNum }}</span>
        </el-card>
        <el-card shadow="always">
          总发布帖子：
          <span class="text-5">{{ dataAnalysis.totalPostPublishNum }}</span>
        </el-card>
        <el-card shadow="always">
          总发布物品：
          <span class="text-5">{{ dataAnalysis.totalGoodPublishNum }}</span>
        </el-card>
      </div>
    </div>
  </div>
</template>
