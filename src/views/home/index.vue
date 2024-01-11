<script setup lang="ts">
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr'

const connection = new HubConnectionBuilder()
  .withUrl('http://192.168.31.103:5014/hubs/message', {
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

start()
onMounted(() => {})
</script>

<template>
  <div class="home">
    <div>首页</div>
  </div>
</template>
