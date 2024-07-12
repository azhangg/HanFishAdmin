<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
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

camera.position.set(0, 1.5, 6)

//创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true })

renderer.setSize(window.innerWidth, window.innerHeight)

const controls = new OrbitControls(camera, renderer.domElement)
//设置自动旋转
controls.autoRotate = true

//加载场景贴图
const rgbeLoader = new RGBELoader()
rgbeLoader.load('../scene/sky12.hdr', (envMap) => {
  envMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = envMap

  scene.environment = envMap
})

//添加机器人
//设置解压缩的加载器
let dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('../draco/gltf/')
dracoLoader.setDecoderConfig({ type: 'js' })
let gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load('../scene/robot.glb', (gltf) => {
  scene.add(gltf.scene)
})

//添加直线光
let ligth1 = new THREE.DirectionalLight(0xffffff, 0.3)
ligth1.position.set(0, 10, 10)
let ligth2 = new THREE.DirectionalLight(0xffffff, 0.3)
ligth2.position.set(0, 10, -10)
let ligth3 = new THREE.DirectionalLight(0xffffff, 0.8)
ligth3.position.set(10, 10, 10)
scene.add(ligth1, ligth2, ligth3)

//添加光阵
let video = document.createElement('video')
video.src = '../scene/zp2.mp4'
video.loop = true
video.muted = true
video.play()
let videoTexture = new THREE.VideoTexture(video)
const videoGeoPlane = new THREE.PlaneGeometry(8, 4.5)
const videoMaterial = new THREE.MeshBasicMaterial({
  map: videoTexture,
  transparent: true,
  side: THREE.DoubleSide,
  alphaMap: videoTexture
})
const videoMesh = new THREE.Mesh(videoGeoPlane, videoMaterial)
videoMesh.position.set(0, 0.2, 0)
videoMesh.rotation.set(-Math.PI / 2, 0, 0)
scene.add(videoMesh)

//添加镜面反射
let reflectorGeometry = new THREE.PlaneGeometry(100, 100)
let reflectorPlane = new Reflector(reflectorGeometry, {
  textureWidth: window.innerWidth,
  textureHeight: window.innerHeight,
  color: 0x332222
})
reflectorPlane.rotation.x = -Math.PI / 2
scene.add(reflectorPlane)

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

let animationId = 0

const animate = () => {
  frame += 1

  renderer.render(scene, camera)

  controls.update()

  animationId = requestAnimationFrame(animate) //逐帧渲染
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
