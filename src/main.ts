import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'

import Store from 'electron-store'
import fs from 'fs'

const store = new Store()

const run = async (data: any) => {
  // TODO: figure out how to asynchronously run this, and return the results
  console.log('run', data)
}

ipcMain.handle('toggle-running-state', async (data) => {
  const key = 'seekr.state.running'

  if (!store.get(key)) {
    store.set(key, false)
  }

  const currentState = store.get(key)
  store.set(key, !currentState)

  if (currentState) {
    await run(data)
  }

  return store.get(key)
})

ipcMain.handle('get-words', async () => {
  if (fs.existsSync('dictionary.txt')) {
    const dictionary = fs
      .readFileSync('dictionary.txt', 'utf8')
      .split('\n')
      .map((word) => word.trim())
    store.set('seekr.words', dictionary)
  } else {
    store.set('seekr.words', [])
  }

  return store.get('seekr.words')
})

ipcMain.handle('get-interesting-domains', async () => {
  if (store.has('seekr.interestingDomains')) {
    return store.get('seekr.interestingDomains')
  }

  if (fs.existsSync('interesting_domains.txt')) {
    const dictionary = fs
      .readFileSync('interesting_domains.txt', 'utf8')
      .split('\n')
      .map((word) => word.trim())
    store.set('seekr.interestingDomains', dictionary)
  } else {
    store.set('seekr.interestingDomains', [])
  }

  return store.get('seekr.interestingDomains')
})

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 1024,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    width: 1280
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'pages/seek_words.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
