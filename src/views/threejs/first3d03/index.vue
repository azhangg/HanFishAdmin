<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
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

const controls = new OrbitControls(camera, renderer.domElement)
//设置带阻尼的惯性
controls.enableDamping = true
//设置阻尼系数
controls.DampingFactor = 0.01
//设置自动旋转
controls.AutoRotate = true

//加载场景贴图
const rgbeLoader = new RGBELoader()
rgbeLoader.load('../scene/out_side.hdr', (envMap) => {
  envMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = envMap

  scene.environment = envMap

  planeMaterial.envMap = envMap
})

//创建纹理加载器
const textureLoader = new THREE.TextureLoader()
//加载纹理
const texture = textureLoader.load('../texture/Wall_Stone_017_SD/Wall_Stone_017_BaseColor.jpg')
//设置纹理颜色空间
texture.colorSpace = THREE.SRGBColorSpace

//加载环境遮蔽贴图
const aoMap = textureLoader.load('../texture/Wall_Stone_017_SD/Wall_Stone_017_AmbientOcclusion.jpg')
//加载高光贴图
const specularMap = textureLoader.load('../texture/Wall_Stone_017_SD/Wall_Stone_017_Height.png')
const planeGeometry = new THREE.BoxGeometry(1, 1, 1)
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xFFFFFF,
  map: texture,
  aoMap,
  reflectivity: 0.1, //反射率
  specularMap
})
const plane = new THREE.Mesh(planeGeometry, planeMaterial)

//请物体添加到场景
scene.add(plane)

camera.position.z = 5
camera.position.y = 2
camera.position.x = 2

let frame = 0

const timer = setInterval(() => {
  fps.value = frame
  frame = 0
}, 1000)

const animate = () => {
  //让物体旋转
  controls.update()

  frame += 1

  renderer.render(scene, camera)
  requestAnimationFrame(animate) //逐帧渲染
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
</style>
