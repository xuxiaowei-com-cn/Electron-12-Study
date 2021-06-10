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
  <button @click="makeNewWindow">创建多个渲染进程</button>
  <button @click="newRendererToMain">通过主进程向其他进程发送消息</button>
  <span>请查看其他进程控制台</span>
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
let remote = require('@electron/remote')

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
    },
    newRendererToMain() {
      // 渲染进程向主进程发送消息
      ipcRenderer.send('new_rendererToMain',
          {'arg5-1': 'value5-1', 'arg5-2': 'value5-2'}, {'arg6-1': 'value6-1', 'arg6-2': 'value6-2'})
    },
    makeNewWindow() {
      // 创建多个渲染进程
      const win = new remote.BrowserWindow({
        webPreferences: {
          // 是否启用`remote`模块。默认值为`false`。
          enableRemoteModule: true,
          // 是否启用Node集成。
          // 默认值为false 。
          nodeIntegration: true,
          // 是否在单独的JavaScript上下文中运行Electron API和指定的`preload`脚本。 默认为true 。
          // `preload`脚本在其中运行的上下文将只能访问其自己的专用`document`和`window`全局变量，
          // 以及其自己的JavaScript内置集合（`Array`，`Object`，`JSON`等），所有这些对于加载的内容都是不可见的。
          // Electron API仅在`preload`脚本中可用，而在加载的页面中不可用。
          // 加载潜在的不受信任的远程内容时，应使用此选项，以确保加载的内容不会篡改`preload`脚本和所使用的任何Electron API。
          // 此选项使用与Chrome Content Scripts相同的技术。
          // 您可以在开发工具中访问此上下文，方法是在“控制台”选项卡顶部的组合框中选择'Electron Isolated Context'条目
          contextIsolation: false
        }
      })
      // eslint-disable-next-line no-undef
      win.loadFile(path.join(__static, 'new_index.html')
    )
    }
  }
}
</script>

<style>
@import "../src/style/app.scss";

</style>
