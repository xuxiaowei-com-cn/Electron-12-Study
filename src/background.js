'use strict'

import { app, protocol, ipcMain, webContents, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'
const path = require('path')
import {autoUpdater} from 'electron-updater'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // eslint-disable-next-line no-undef
      preload: path.join(__static, 'preload.js'),
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await win.loadURL('app://./index.html')
  }

  // 启动项目时检查更新
  await autoUpdater.checkForUpdates()
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     console.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

const feed_url = "http://127.0.0.1/electron"
autoUpdater.setFeedURL(feed_url)

// 接收更新消息
ipcMain.on('main_update', () => {
  autoUpdater.checkForUpdates()
})

// 安装
ipcMain.on('main_install', () => {
  autoUpdater.quitAndInstall()
})

autoUpdater.on('error', function (error) {
  for (let i in webContents.getAllWebContents()) {
    webContents.getAllWebContents()[i].send('render_update', 'error', '更新异常：', error)
  }
})

autoUpdater.on('checking-for-update', function (info) {
  for (let i in webContents.getAllWebContents()) {
    webContents.getAllWebContents()[i].send('render_update', 'checking-for-update', '检测版本信息：', info)
  }
})

autoUpdater.on('update-available', function (info) {
  for (let i in webContents.getAllWebContents()) {
    webContents.getAllWebContents()[i].send('render_update', 'update-available', '检测到新版本，正在下载：', info)
  }
})

autoUpdater.on('update-not-available', function (info) {
  for (let i in webContents.getAllWebContents()) {
    webContents.getAllWebContents()[i].send('render_update', 'update-not-available', '无需更新：', info)
  }
})

autoUpdater.on('download-progress', function (info) {
  for (let i in webContents.getAllWebContents()) {
    webContents.getAllWebContents()[i].send('render_update', 'download-progress', '下载进度：', info)
  }
})

autoUpdater.on('update-downloaded', function (info) {
  for (let i in webContents.getAllWebContents()) {
    webContents.getAllWebContents()[i].send('render_update_update-downloaded', 'update-downloaded', '更新下载：', info)
  }
})
