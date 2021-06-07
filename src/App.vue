<template>
  <img alt="Vue logo" src="./assets/logo.png">

  <br>
  <input id="numA" type="text"/>
  <input id="numB" type="text"/>
  <button @click="sum">求和</button>
  <input id="numC" type="text" disabled/>
  <span>非数字会直接忽略</span>
  <br>
  <button @click="version">获取当前版本</button>
  <button @click="update">检查更新</button>
  <button @click="install" id="install" style="display: none">安装</button>
  <span>请查看控制台</span>
  <br>
  <button @click="rendererToMain">渲染进程向主进程发送消息</button>
  <span>请查看控制台</span>
  <br>
  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

const ffi = require('ffi-napi')
const path = require('path')
const fs = require("fs")
let {ipcRenderer} = require('electron')
const package_json = require('../package.json');

// 获取 DLL 路径（根据不同平台，选择不同的DLL）
// eslint-disable-next-line no-undef
let dll_path = path.join(__static, `dll/arithmetic-operations_${process.arch}.dll`)

// 修正开发环境的路径
dll_path = dll_path.replace('\\public\\', '\\')

// 修正生产环境的路径
dll_path = dll_path.replace('\\resources\\app.asar\\', '\\')

// 主进程向渲染进程发送消息
ipcRenderer.on('render_update', (event, type, msg, param) => {
  console.log(type, msg, param)
})

// 主进程向渲染进程发送消息
ipcRenderer.on('render_update_update-downloaded', (event, type, msg, param) => {
  console.log(type, msg, param)
  document.getElementById('install').style.display = ""
})

// 主进程向渲染进程发送消息
ipcRenderer.on('mainToRenderer', (event, arg3, arg4) => {
  console.log('渲染进程接收到发送者：', event.sender)
  console.log('渲染进程接收参数3：', arg3)
  console.log('渲染进程接收参数4：', arg4)
})

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  methods: {
    sum() {

      fs.access(dll_path, function (err) {
        if (err) {
          console.error(dll_path)
          alert('DLL 文件不存在：' + dll_path)
        } else {
          console.log('DLL 文件已存在：', dll_path)
        }
      })

      const dll = new ffi.Library(dll_path, {
        'sum':
            [
              'int', ['int', 'int']
            ]
      })

      const result = dll.sum(
          parseInt(document.getElementById("numA").value),
          parseInt(document.getElementById("numB").value)
      )

      document.getElementById('numC').value = result.toString()

    },
    version() {
      // electron 版本
      console.log(package_json.version)
    },
    update() {
      // 渲染进程向主进程发送消息
      ipcRenderer.send('main_update')
    },
    install() {
      // 渲染进程向主进程发送消息
      ipcRenderer.send('main_install')
    },
    rendererToMain() {
      // 渲染进程向主进程发送消息
      ipcRenderer.send('rendererToMain',
          {'arg1-1': 'value1-1', 'arg1-2': 'value1-2'}, {'arg2-1': 'value2-1', 'arg2-2': 'value2-2'})
    }
  }
}
</script>

<style>
@import "../src/style/app.scss";

</style>
