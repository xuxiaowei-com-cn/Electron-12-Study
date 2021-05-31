<template>
  <img alt="Vue logo" id="img" src="./assets/logo.png">

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
  <HelloWorld msg="Welcome to Your Vue.js App"/>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

const ffi = require('ffi-napi')
const path = require('path')
const fs = require("fs")
let {ipcRenderer} = require('electron')
const package_json = require('../package.json')
const iconv = require('iconv-lite')

// 获取 DLL 路径（根据不同平台，选择不同的DLL）
// eslint-disable-next-line no-undef
let dll_path = path.join(__static, `dll/termb.dll`)

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

export default {
  name: 'App',
  components: {
    HelloWorld
  },
  methods: {
    sum: function () {

      fs.access(dll_path, function (err) {
        if (err) {
          console.error(dll_path)
          alert('DLL 文件不存在：' + dll_path)
        } else {
          console.log('DLL 文件已存在：', dll_path)
        }
      })

      const dll = new ffi.Library(dll_path, {
        'InitComm':
            [
              'int', ['int']
            ],
        'Authenticate':
            [
              'int', []
            ],
        'Read_Content':
            [
              'int', ['int']
            ],
        'GetPeopleName':
            [
              'int', ['string', 'int']
            ],
        'GetPeopleSex':
            [
              'int', ['char*', 'int']
            ],
        'GetPeopleNation':
            [
              'int', ['char*', 'int']
            ],
        'GetPeopleBirthday':
            [
              'int', ['char*', 'int']
            ],
        'GetPeopleAddress':
            [
              'int', ['char*', 'int']
            ],
        'GetPeopleIDCode':
            [
              'int', ['char*', 'int']
            ],
        'GetDepartment':
            [
              'int', ['char*', 'int']
            ],
        'GetStartDate':
            [
              'int', ['char*', 'int']
            ],
        'GetEndDate':
            [
              'int', ['char*', 'int']
            ],
        'GetReserve':
            [
              'int', ['char*', 'int']
            ],
        'GetPhotoBMP':
            [
              'int', ['char*', 'int']
            ],
        'CloseComm':
            [
              'int', ['int']
            ]
      })

      /**
       * 初始化
       *
       * 参数：
       * 串口：1-16
       * USB：1001-1016
       *
       * 返回值：
       * 正确：1
       * 错误：其他
       */
      let InitComm_result = dll.InitComm(1001)
      console.log('初始化：', InitComm_result)

      let Authenticate_result = dll.Authenticate()
      console.log('卡认证：', Authenticate_result)

      /**
       *
       */
      let Read_Content_result = dll.Read_Content(1)
      console.log('读卡：', Read_Content_result)

      if (Read_Content_result === 1) {
        let name = new Buffer(30)
        let GetPeopleName_result = dll.GetPeopleName(name, name.length)
        console.log('姓名：', GetPeopleName_result, iconv.decode(name, 'GBK'))

        let sex = new Buffer(2)
        let GetPeopleSex_result = dll.GetPeopleSex(sex, sex.length)
        console.log('性别：', GetPeopleSex_result, iconv.decode(sex, 'GBK'))

        let nation = new Buffer(4)
        let GetPeopleNation_result = dll.GetPeopleNation(nation, nation.length)
        console.log('民族：', GetPeopleNation_result, iconv.decode(nation, 'GBK'))

        let birthday = new Buffer(16)
        let GetPeopleBirthday_result = dll.GetPeopleBirthday(birthday, birthday.length)
        console.log('出生日期：', GetPeopleBirthday_result, birthday.toString())

        let address = new Buffer(70)
        let GetPeopleAddress_result = dll.GetPeopleAddress(address, address.length)
        console.log('地址：', GetPeopleAddress_result, iconv.decode(address, 'GBK'))

        let idCard = new Buffer(36)
        let GetPeopleIDCode_result = dll.GetPeopleIDCode(idCard, idCard.length)
        console.log('身份证号码：', GetPeopleIDCode_result, idCard.toString())

        let department = new Buffer(30)
        let GetDepartment_result = dll.GetDepartment(department, department.length)
        console.log('签发机关：', GetDepartment_result, iconv.decode(department, 'GBK'))

        let startDate = new Buffer(16)
        let GetStartDate_result = dll.GetStartDate(startDate, startDate.length)
        console.log('启始日期：', GetStartDate_result, startDate.toString())

        let endDate = new Buffer(16)
        let GetEndDate_result = dll.GetEndDate(endDate, endDate.length)
        console.log('截止日期：', GetEndDate_result, endDate.toString())

        let reserve = new Buffer(36)
        let GetReserve_result = dll.GetReserve(reserve, reserve.length)
        console.log('预留字段：', GetReserve_result, reserve.toString())

        let photo = new Buffer(81920)
        let GetPhotoBMP_result = dll.GetPhotoBMP(photo, photo.length)
        let src = "data:image/png;base64," + photo.toString("base64", 0, photo.length)
        console.log('照片信息：', GetPhotoBMP_result, src)
        document.getElementById('img').src = src

      }

      /**
       *
       */
      let CloseComm_result = dll.CloseComm(1)
      console.log('关闭卡：', CloseComm_result)

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
    }
  }
}
</script>

<style>
@import "../src/style/app.scss";

</style>
