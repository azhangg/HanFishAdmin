<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
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

//创建几何体
const geometry = new THREE.BoxGeometry(1, 1, 1)

//创建材质
const material = new THREE.MeshBasicMaterial({ color: 0x00FF00 })
const parentMaterial = new THREE.MeshBasicMaterial({ color: 0xFF0000 })

//创建网格
const parentCube = new THREE.Mesh(geometry, parentMaterial)

const cube = new THREE.Mesh(geometry, material)

parentCube.add(cube)

parentCube.position.set(-3, 0, 0)
cube.position.set(3, 0, 0)
cube.scale.set(2, 2, 2)
//绕x轴旋转
cube.rotation.x = Math.PI / 4

//创建世界坐标辅助器
const axesHelper = new THREE.AxesHelper(5)

const controls = new OrbitControls(camera, renderer.domElement)
//设置带阻尼的惯性
controls.enableDamping = true
//设置阻尼系数
controls.DampingFactor = 0.01
//设置自动旋转
controls.AutoRotate = true

//请物体添加到场景
scene.add(parentCube)
scene.add(axesHelper)

camera.position.z = 5
camera.position.y = 2
camera.position.x = 2

let frame = 0

const timer = setInterval(() => {
  fps.value = frame
  frame = 0
}, 1000)

//创建GUI

const eventObj = {
  FullScreen: () => document.body.requestFullscreen(),
  ExitFullScreen: () => document.exitFullscreen()
}

const gui = new GUI()

gui.add(eventObj, 'FullScreen').name('全屏')
gui.add(eventObj, 'ExitFullScreen').name('退出全屏')
//控制立方体位置
const folder = gui.addFolder('立方体位置')
folder.add(cube.position, 'x').min(-10).max(10).step(1).name('立方体X轴位置')
folder.add(cube.position, 'y').min(-10).max(10).step(1).name('立方体Y轴位置')
folder.add(cube.position, 'z').min(-10).max(10).step(1).name('立方体Z轴位置')

gui.add(parentMaterial, 'wireframe').name('父元素线框模式')

const colorParams = {
  cubeColor: '#ff0000'
}

gui
  .addColor(colorParams, 'cubeColor')
  .name('立方体颜色')
  .onChange((val) => cube.material.color.set(val))

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

  //让物体旋转
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
  gui.destroy()
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
