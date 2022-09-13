import { app, BrowserWindow, ipcMain } from 'electron'
import * as path from 'path'

import { Crawler, InternetComputer, WordExpansion } from 'seekr'

import Store from 'electron-store'
import fs from 'fs'
import { SeekrGui } from './seekrGui'

const store = new Store()

let crawler = null

class Operations {
  constructor() {}

  wordsFrom(file: string) {
    return fs
      .readFileSync(file, 'utf8')
      .split('\n')
      .map((word) => word.trim())
      .filter((word) => word.length > 0)
  }
}

const run = async (output: any) => {
  const words = store.get(SeekrGui.Keys.State.Words) as Array<string>
  const interestingDomains = store.get(
    SeekrGui.Keys.State.InterestingDomains
  ) as Array<string>
  const debug = true

  crawler = new Crawler(
    words,
    debug,
    output,
    Crawler.DefaultSimultaneousRequests,
    Crawler.DefaultRequestTimeout,
    interestingDomains
  )
  await crawler.init()

  const internetComputer = new InternetComputer()

  await internetComputer.fetchAll(crawler.enqueueCrawl.bind(crawler))
}

ipcMain.handle(
  SeekrGui.Keys.Channels.ToggleExpandedWords,
  async (_event, useExpandedKeywords: boolean) => {
    store.set(SeekrGui.Keys.State.UseExpandedWords, useExpandedKeywords)
  }
)

ipcMain.handle(SeekrGui.Keys.Channels.BackUpWords, async (_event) => {
  store.set(
    SeekrGui.Keys.State.BackupWords,
    store.get(SeekrGui.Keys.State.Words)
  )
})

ipcMain.handle(SeekrGui.Keys.Channels.RestoreWords, async (_event) => {
  store.set(
    SeekrGui.Keys.State.Words,
    store.get(SeekrGui.Keys.State.BackupWords)
  )
})

ipcMain.handle(
  SeekrGui.Keys.Channels.GetReportResults,
  async (): Promise<Array<any>> => {
    return store.get(SeekrGui.Keys.State.ReportResults) as Array<any>
  }
)

ipcMain.handle(
  SeekrGui.Keys.Channels.GetWords,
  async (): Promise<Array<string>> => {
    if (fs.existsSync(SeekrGui.FileNames.Dictionary)) {
      store.set(
        SeekrGui.Keys.State.Words,
        new Operations().wordsFrom(SeekrGui.FileNames.Dictionary)
      )
    } else {
      store.set(SeekrGui.Keys.State.Words, [])
    }

    return store.get(SeekrGui.Keys.State.Words) as Array<string>
  }
)

ipcMain.handle(
  SeekrGui.Keys.Channels.SetWords,
  async (_event, words: Array<string>) => {
    store.set(SeekrGui.Keys.State.Words, words)
  }
)

ipcMain.handle(
  SeekrGui.Keys.Channels.GetExpandedWords,
  async (): Promise<Array<string>> => {
    const words = store.get(SeekrGui.Keys.State.Words) as string[]

    const wordExpansion = new WordExpansion()

    const expandedWords = words.flatMap((word) => {
      return wordExpansion.expand(word)
    })

    const wordsSet = new Set(expandedWords)

    words.forEach((word) => {
      wordsSet.add(word)
    })

    store.set(SeekrGui.Keys.State.ExpandedWords, Array.from(wordsSet))

    return store.get(SeekrGui.Keys.State.ExpandedWords) as Array<string>
  }
)

ipcMain.handle(SeekrGui.Keys.Channels.GetInterestingDomains, async () => {
  if (store.has(SeekrGui.Keys.State.InterestingDomains)) {
    return store.get(SeekrGui.Keys.State.InterestingDomains)
  }

  if (fs.existsSync(SeekrGui.FileNames.InterestingDomains)) {
    store.set(
      SeekrGui.Keys.State.InterestingDomains,
      new Operations().wordsFrom(SeekrGui.FileNames.InterestingDomains)
    )
  } else {
    store.set(SeekrGui.Keys.State.InterestingDomains, [])
  }

  return store.get(SeekrGui.Keys.State.InterestingDomains)
})

ipcMain.addListener(SeekrGui.Keys.Channels.ReportResults, (event: any) => {
  console.log('<<< MAIN ipcMain.addListener event', event)
})

ipcMain.handle(SeekrGui.Keys.Channels.ToggleRunningState, async () => {
  if (!store.get(SeekrGui.Keys.State.Running)) {
    store.set(SeekrGui.Keys.State.Running, false)
  }

  const formerState = store.get(SeekrGui.Keys.State.Running)
  store.set(SeekrGui.Keys.State.Running, !formerState)

  const currentState = store.get(SeekrGui.Keys.State.Running)

  if (currentState === true) {
    const output = (input: any) => {
      ipcMain.emit(SeekrGui.Keys.Channels.ReportResults, input)
      const results = store.get(SeekrGui.Keys.State.ReportResults) as Array<any>
      results.push(input)
      store.set(SeekrGui.Keys.State.ReportResults, results)
    }
    await run(output)
  }

  return currentState
})

const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    height: 1024,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
    width: 1280
  })

  // and load the index.html of the app.
  await mainWindow.loadFile(path.join(__dirname, 'pages/seek_words.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

function clearState() {
  store.clear()
  store.set(SeekrGui.Keys.State.ReportResults, [])
}

app.on('ready', async () => {
  clearState()
  await createWindow()

  app.on('activate', function () {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
