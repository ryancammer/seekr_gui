import { contextBridge, ipcRenderer } from 'electron'

export class SeekrGui {
  static readonly FileNames = class {
    static readonly Dictionary = 'dictionary.txt'
    static readonly InterestingDomains = 'interesting_domains.txt'
  }

  static readonly Keys = class {
    static readonly Channels = class {
      static readonly BackUpWords = 'back-up-words'
      static readonly GetWords = 'get-words'
      static readonly GetExpandedWords = 'get-expanded-words'
      static readonly GetInterestingDomains = 'get-interesting-domains'
      static readonly GetReportResults = 'get-report-results'
      static readonly ReportResults = 'report-results'
      static readonly RestoreWords = 'restore-words'
      static readonly SetWords = 'set-words'
      static readonly SetInterestingDomains = 'set-interesting-domains'
      static readonly ToggleExpandedWords = 'toggle-expanded-words'
      static readonly ToggleRunningState = 'toggle-running-state'
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {})

contextBridge.exposeInMainWorld('seekr', {
  backUpWords: async () => {
    return await ipcRenderer.invoke(SeekrGui.Keys.Channels.BackUpWords)
  },

  getExpandedWords: async () => {
    return await ipcRenderer.invoke(SeekrGui.Keys.Channels.GetExpandedWords)
  },

  getInterestingDomains: async () => {
    return await ipcRenderer.invoke(
      SeekrGui.Keys.Channels.GetInterestingDomains
    )
  },

  getReportResults: async () => {
    return await ipcRenderer.invoke(SeekrGui.Keys.Channels.GetReportResults)
  },

  getWords: async () => {
    return await ipcRenderer.invoke(SeekrGui.Keys.Channels.GetWords)
  },

  reportResults: (listener: any) => {
    ipcRenderer.addListener(SeekrGui.Keys.Channels.ReportResults, listener)
  },

  restoreWords: async () => {
    await ipcRenderer.invoke(SeekrGui.Keys.Channels.RestoreWords)
  },

  setInterestingDomains: async (interestingDomains: string[]) => {
    await ipcRenderer.invoke(
      SeekrGui.Keys.Channels.SetInterestingDomains,
      interestingDomains
    )
  },

  setWords: async (words: string[]) => {
    await ipcRenderer.invoke(SeekrGui.Keys.Channels.SetWords, words)
  },

  toggleExpandedWords: async (useExpandedKeywords: boolean) => {
    return await ipcRenderer.invoke(
      SeekrGui.Keys.Channels.ToggleExpandedWords,
      useExpandedKeywords
    )
  },

  toggleRunningState: async () => {
    return await ipcRenderer.invoke(SeekrGui.Keys.Channels.ToggleRunningState)
  },

  somethingHappened(callback: any) {
    ipcRenderer.on('report-results', callback)
  }
})
