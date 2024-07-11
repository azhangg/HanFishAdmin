<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
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
const geometry = new THREE.BufferGeometry()
//创建顶点数据，顶点是有序的，每三个为一个顶点，逆时针为正面
const vertices = new Float32Array([
  -1.0,
  -1.0,
  0.0,
  1.0,
  -1.0,
  0.0,
  1.0,
  1.0,
  0.0,
  1.0,
  1.0,
  0.0,
  -1.0,
  1.0,
  0.0,
  -1.0,
  -1.0,
  0.0
])
//创建顶点属性
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

//使用索引绘制
const geometry1 = new THREE.BufferGeometry()
//创建顶点
const vertices1 = new Float32Array([2, -1, 0, 4, -1, 0, 4, 1, 0, 2, 1, 0])
//设置顶点属性
geometry1.setAttribute('position', new THREE.BufferAttribute(vertices1, 3))
//创建索引
const indexes = new Uint16Array([0, 1, 2, 2, 3, 0])
//创建索引属性
geometry1.setIndex(new THREE.BufferAttribute(indexes, 1))

//设置2个顶点组，形成2个材质
geometry1.addGroup(0, 3, 0) //从索引0开始使用3个索引，使用第一个材质
geometry1.addGroup(3, 3, 1) //从索引3开始使用3个索引，使用第二个材质

//立方体设置不同颜色
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1)

//创建材质
const material = new THREE.MeshBasicMaterial({
  color: 0x00FF00,
  wireframe: true
})

const material0 = new THREE.MeshBasicMaterial({
  color: 0x00FF00
})

const material1 = new THREE.MeshBasicMaterial({
  color: 0xFF0000
})

const material2 = new THREE.MeshBasicMaterial({
  color: 0x0000FF
})

const material3 = new THREE.MeshBasicMaterial({
  color: 0xFFFF00
})

const material4 = new THREE.MeshBasicMaterial({
  color: 0xFF00FF
})

const material5 = new THREE.MeshBasicMaterial({
  color: 0x00FFFF
})

const plane = new THREE.Mesh(geometry, material)

const plane1 = new THREE.Mesh(geometry1, [material, material1])

const cube = new THREE.Mesh(cubeGeometry, [material0, material1, material2, material3, material4, material5])

cube.position.z = 2

//创建世界坐标辅助器
const axesHelper = new THREE.AxesHelper(5)

const controls = new OrbitControls(camera, renderer.domElement)
//设置带阻尼的惯性
controls.enableDamping = true
//设置阻尼系数
controls.DampingFactor = 0.01

//请物体添加到场景
scene.add(plane)
scene.add(plane1)
scene.add(cube)
scene.add(axesHelper)

camera.position.z = 5
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
