<template>
  <img alt="Vue logo" src="./assets/logo.png">

  <br>
  <input id="numA" type="text"/>
  <input id="numB" type="text"/>
  <button @click="sum">求和</button>
  <input id="numC" type="text" disabled/>
  <br>

  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
const ffi = require('ffi-napi')
const path = require('path')
const fs = require("fs")

// 获取 DLL 路径
// eslint-disable-next-line no-undef
let dll_path = path.join(__static, 'dll/arithmeticoperations.dll')

// 修正开发环境的路径
dll_path = dll_path.replace('\\public\\', '\\')

// 修正生产环境的路径
dll_path = dll_path.replace('\\resources\\app.asar\\', '\\')

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  methods: {
    sum() {

      fs.access(dll_path, function (err) {
        if (err) {
          alert('DLL 文件不存在：'+ dll_path)
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

    }
  }
}
</script>

<style>
@import "../src/style/app.scss";

</style>
