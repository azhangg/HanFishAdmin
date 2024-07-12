<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { onMounted, onUnmounted, ref } from 'vue'

let currentObj

const threeJs01Ref = ref()

const fps = ref(0)

//创建场景
const scene = new THREE.Scene()

//创建相机
const camera = new THREE.PerspectiveCamera(
  75, //视角
  window.innerWidth / window.innerHeight, //宽高比
  0.1, //近平面
  1000 //远平面
)

//创建渲染器
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)

//创建世界坐标辅助器
const axesHelper = new THREE.AxesHelper(5)

const controls = new OrbitControls(camera, renderer.domElement)
//设置带阻尼的惯性
controls.enableDamping = true
//设置阻尼系数
controls.DampingFactor = 0.01
//设置自动旋转
controls.AutoRotate = true

//创建三个球
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)

const sphere1 = new THREE.Mesh(
  sphereGeometry,
  new THREE.MeshBasicMaterial({
    color: 0x00ff00
  })
)

const sphere2 = new THREE.Mesh(
  sphereGeometry,
  new THREE.MeshBasicMaterial({
    color: 0xff0000
  })
)

const sphere3 = new THREE.Mesh(
  sphereGeometry,
  new THREE.MeshBasicMaterial({
    color: 0x0000ff
  })
)

//创建射线
const raycaster = new THREE.Raycaster()
//创建鼠标向量
const mouse = new THREE.Vector2()

sphere1.position.x = -3
sphere3.position.x = 3

//请物体添加到场景
scene.add(axesHelper)
scene.add(sphere1)
scene.add(sphere2)
scene.add(sphere3)

camera.position.z = 10
camera.position.y = 2
camera.position.x = 2

let frame = 0

const timer = setInterval(() => {
  fps.value = frame
  frame = 0
}, 1000)

const onMouseMove = (e) => {
  //设置鼠标向量的x,y值
  mouse.x = (e.offsetX / e.target.offsetWidth) * 2 - 1
  mouse.y = 1 - (e.offsetY / e.target.offsetHeight) * 2

  //通过摄像机和鼠标位置更新射线
  raycaster.setFromCamera(mouse, camera)

  //计算物体与射线的焦点，判断是否碰到物体
  const intersects = raycaster.intersectObjects([sphere1, sphere2, sphere3])

  currentObj ? currentObj.material.color.setStyle(currentObj._originStyle) : (currentObj = null) //高亮显示切换

  if (intersects.length) {
    currentObj = intersects[0].object
    currentObj._originStyle = currentObj.material.color.getStyle()
    currentObj.material.color.setStyle('#fad390') //高亮显示切换
  }
}

//监听窗口变化
window.addEventListener('resize', () => {
  //重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight)
  //重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight
  //更新相机投影矩阵
  camera.updateProjectionMatrix()
})

let animationId = 0

const animate = () => {
  animationId = requestAnimationFrame(animate) //逐帧渲染

  controls.update()

  frame += 1

  renderer.render(scene, camera)
}

onMounted(() => {
  //向特定位置追加子元素
  threeJs01Ref.value.appendChild(renderer.domElement)

  animate()
})

onUnmounted(() => {
  clearInterval(timer)
  cancelAnimationFrame(animationId)
})
</script>

<template>
  <div ref="threeJs01Ref" class="threejscontainer" @mousemove="onMouseMove($event)">
    <div class="fps">FPS: {{ fps }}</div>
  </div>
</template>

<style lang="scss">
.threejscontainer {
  position: relative;
  height: 100%;
  .fps {
    position: fixed;
    color: greenyellow;
    z-index: 100000;
  }
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  right: 15px;
  top: 100px;
  z-index: 1001;
}
</style>
