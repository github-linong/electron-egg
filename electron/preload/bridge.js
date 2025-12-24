const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  invoke: async (channel, data) => {
    return await ipcRenderer.invoke(channel, data)
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data)
  },
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args))
  }
})

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: ipcRenderer,
})