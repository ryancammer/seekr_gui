// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { contextBridge, ipcRenderer } from 'electron'

window.addEventListener('DOMContentLoaded', () => {})

contextBridge.exposeInMainWorld('seekr', {
  getWords: async () => {
    return await ipcRenderer.invoke('get-words')
  },

  getInterestingDomains: async () => {
    return await ipcRenderer.invoke('get-interesting-domains')
  },

  toggleRunningState: async () => {
    return await ipcRenderer.invoke('toggle-running-state', {
      dictionary: document.querySelector('#dictionary')?.innerHTML,
      interestingDomains: document.querySelector('#interesting-domains')
        ?.innerHTML
    })
  }
})
