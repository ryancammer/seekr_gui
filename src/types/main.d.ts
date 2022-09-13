export {}

declare global {
  interface Window {
    seekr: any // 👈️ turn off type checking
    isElectron: boolean
    ipcRenderer: any // 👈️ turn off type checking
  }
}
