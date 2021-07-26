<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">

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
    <button @click="newRendererToRenderer">直接向其他进程发送消息</button>
    <span>请查看其他进程控制台</span>
    <br>
    <button @click="basicNoti">Notification 基本通知</button>
    <button @click="advancedNoti">Notification 高级通知</button>
    <br>
    <el-button>默认按钮</el-button>
    <br>
    <el-button @click="increment">vuex</el-button>
    <br>
    <el-button @click="jsEncrypt">JsEncrypt</el-button>
    <br>
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'
import JsEncrypt from 'jsencrypt/bin/jsencrypt.min' // 导入 JsEncrypt 依赖

const ffi = require('ffi-napi')
const path = require('path')
const fs = require("fs")
let {ipcRenderer} = require('electron')
const package_json = require('../../package.json');
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
    newRendererToRenderer() {
      // 渲染进程向渲染进程发送消息
      for (let i in remote.webContents.getAllWebContents()) {
        remote.webContents.getAllWebContents()[i].send('new_rendererToRenderer',
            {'arg7-1': 'value7-1', 'arg7-2': 'value7-2'}, {'arg8-1': 'value8-1', 'arg8-2': 'value8-2'})
      }
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
    },
    basicNoti() {
      const notificationBasic = {title: '基本通知', body: '短消息部分'}
      const myNotification = new window.Notification(notificationBasic.title, notificationBasic)
      console.log(myNotification)
      myNotification.onclick = () => {
        console.log('onclick')
      }
      myNotification.onclose = () => {
        console.log('onclose')
      }
      myNotification.onerror = () => {
        console.log('onerror')
      }
      myNotification.onshow = () => {
        console.log('onshow')
      }
      myNotification.addEventListener('click', () => {
        console.log('addEventListener click')
      })
    },
    advancedNoti() {
      const notificationAdvanced = {
        title: 'Notification with image',
        body: 'Short message plus a custom image',
        icon: 'programming.png'
      }
      const myNotification = new window.Notification(notificationAdvanced.title, notificationAdvanced)
      console.log(myNotification)
      myNotification.onclick = () => {
        console.log('onclick')
      }
      myNotification.onclose = () => {
        console.log('onclose')
      }
      myNotification.onerror = () => {
        console.log('onerror')
      }
      myNotification.onshow = () => {
        console.log('onshow')
      }
      myNotification.addEventListener('click', () => {
        console.log('addEventListener click')
      })
    },
    increment() {
      this.$store.commit('increment')
      console.log(this.$store.state.count)
    },
    jsEncrypt() {
      const RSA_PUBLIC_KEY = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCD5XD8TEL7d6EwN6WohUhLMPbx7LumqTY4hD0wHQDVB8QcOtyKiHTJEL+KnmY662gkDJnxiaeMUqX5c2AneXf3wLCYi6I8JmFqSNhOdxNdo/YvklPcmBAmxpW2grZdO4J2MWVykHrAMD07YJOKXDZcwe4HQgpoIH7hKvalcc4QnQIDAQAB'
      console.log('RSA_PUBLIC_KEY：', RSA_PUBLIC_KEY)
      JsEncrypt.prototype.setPublicKey(RSA_PUBLIC_KEY)
      const text = '你好，Electron！'
      console.log('text：', text)
      const encrypt = JsEncrypt.prototype.encrypt(text)
      console.log('encrypt：', encrypt)
      const RSA_PRIVATE_KEY = 'MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAIPlcPxMQvt3oTA3paiFSEsw9vHsu6apNjiEPTAdANUHxBw63IqIdMkQv4qeZjrraCQMmfGJp4xSpflzYCd5d/fAsJiLojwmYWpI2E53E12j9i+SU9yYECbGlbaCtl07gnYxZXKQesAwPTtgk4pcNlzB7gdCCmggfuEq9qVxzhCdAgMBAAECgYBYoWqOL5TnNFlddFdeacnNtSaMJR9n+9cSnVIcrbCsdl6C9c7TTKTlo9qChLR/rUa6yrj7xRuQwM0FVlFr1UUWeoiYK4A7KKSMwbe5HZkj5hZM1O9T/nqXrdI+qztqUcPMoThE1W3pSJ1SuFH2NSoWyXuyYXRdoAyTwoVSVZ4WBQJBAOeqB4PlrNCVgCveabrc/WTTSuUvu42NKG7n7huaQtrDH7uy0GIumq8MwuZl+R6ZUtyxv2CA9MK0dPyPKSkDbCcCQQCRwG2g2XPgCDXyy0Sl+GOEnkf2JWKVhuGrlCf41gwJP77JPMekSrNi0Yw27c0YwdFmrtm/GKAGhL4vYtvxo+ObAkEAqkRl0aN1KLk4wwVtYFIcS4agfWJfzuH43crJTrBKgs72+9WpIwBt4ErY1M4OE1dNd7eMmTkurAxGD3qJHgPN8QJAbIQSm0GLjm9Oi1hf4hpPLfwSo+ctwRpNhsul/xSOnYxCZd3E3kNnz9koRfVDUH1thMAGCsswyemnF+zIyN42pQJAI6ZJSx+bUacrS6yhPLKJXDRrZtp7xCGLesc6kMK6Yyaa2FcQWs+XZncPEdlFxsFgOgAsBd9s+PpCv6DRFIR9Lg=='
      console.log('RSA_PRIVATE_KEY：', RSA_PRIVATE_KEY)
      JsEncrypt.prototype.setPrivateKey(RSA_PRIVATE_KEY)
      const decrypt = JsEncrypt.prototype.decrypt(encrypt)
      console.log('decrypt：', decrypt)
    }
  }
}
</script>
