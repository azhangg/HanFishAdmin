<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as TWEEN from 'three/examples/jsm/libs/tween.module.js'
import { onMounted, onUnmounted, ref } from 'vue'

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

const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)

const sphere1 = new THREE.Mesh(
  sphereGeometry,
  new THREE.MeshBasicMaterial({
    color: 0x00FF00
  })
)

const tween = new TWEEN.Tween(sphere1.position)
const tween1 = new TWEEN.Tween(sphere1.position)
const tween2 = new TWEEN.Tween(sphere1.position)
const tween3 = new TWEEN.Tween(sphere1.position)

tween.to({ x: -4, y: 0 }, 1000)
tween1.to({ x: 4, y: 0 }, 1000)
tween2.to({ x: 4, y: -4 }, 1000)
tween3.to({ x: 0, y: 0 }, 1000)

tween.chain(tween1)
tween1.chain(tween2)
tween2.chain(tween3)
tween3.chain(tween)

// tween.repeat(Infinity)//重复动画

// tween.yoyo(true)//往复运动

tween.easing(TWEEN.Easing.Quadratic.InOut)
tween1.easing(TWEEN.Easing.Quadratic.InOut)
tween2.easing(TWEEN.Easing.Quadratic.InOut)
tween3.easing(TWEEN.Easing.Quadratic.InOut)

tween.start()

//请物体添加到场景
scene.add(axesHelper)
scene.add(sphere1)

camera.position.z = 10
camera.position.y = 2
camera.position.x = 2

let frame = 0

const timer = setInterval(() => {
  fps.value = frame
  frame = 0
}, 1000)

//监听窗口变化
window.addEventListener('resize', () => {
  //重置渲染器宽高比
  renderer.setSize(window.innerWidth, window.innerHeight)
  //重置相机宽高比
  camera.aspect = window.innerWidth / window.innerHeight
  //更新相机投影矩阵
  camera.updateProjectionMatrix()
})

const animate = () => {
  requestAnimationFrame(animate) //逐帧渲染

  controls.update()

  TWEEN.update()

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
})
</script>

<template>
  <div ref="threeJs01Ref" class="threejscontainer">
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
