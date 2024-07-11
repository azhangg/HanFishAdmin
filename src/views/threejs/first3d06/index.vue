<script setup lang="ts">
import * as THREE from 'three'
import { onMounted, onUnmounted, ref } from 'vue'

const threeJs01Ref = ref()

const fps = ref(0)

//创建场景
const scene = new THREE.Scene()

//创建相机
const camera = new THREE.PerspectiveCamera(
  90, //视角
  window.innerWidth / window.innerHeight, //宽高比
  0.1, //近平面
  1000 //远平面
)

camera.position.set(0, 0, 5)

//创建渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true })

renderer.setSize(window.innerWidth, window.innerHeight)

//加载纹理
const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('/images/soil-8080788_1920.jpg')
const depthTexture = textureLoader.load('/images/soil-8080788_1920_disparity.png')

//鼠标坐标
const mouse = new THREE.Vector2()

//创建平面
const geometry = new THREE.PlaneGeometry(16, 9)

//使用着色器材质
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uTexture: { value: texture },
    uDepthTexture: { value: depthTexture },
    uMouse: { value: mouse }
  },
  vertexShader: `
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform sampler2D uDepthTexture;
    uniform vec2 uMouse;
    varying vec2 vUv;
    uniform float uTime;
    void main(){
      vec4 color = texture2D(uTexture, vUv);
      vec4 depth = texture2D(uDepthTexture, vUv);
      float depthValue = depth.r;
      float x = vUv.x + (uMouse.x + sin(uTime)) * 0.02 * depthValue;
      float y = vUv.y + (uMouse.y + cos(uTime)) * 0.02 * depthValue;
      vec4 newColor = texture2D(uTexture, vec2(x, y));
      gl_FragColor = newColor;
    }
  `
})

const plane = new THREE.Mesh(geometry, material)

scene.add(plane)

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

const onMouseMove = (e) => {
  //设置鼠标向量的x,y值
  mouse.x = (e.offsetX / e.target.offsetWidth) * 2 - 1
  mouse.y = 1 - (e.offsetY / e.target.offsetHeight) * 2
}

const animate = () => {
  material.uniforms.uMouse.value = mouse
  material.uniforms.uTime.value = performance.now() / 1000

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
