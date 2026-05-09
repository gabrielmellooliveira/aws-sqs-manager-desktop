import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('sqsAPI', {
  start: (params: {
    arn: string
    region?: string
    accessKeyId?: string
    secretAccessKey?: string
  }) => ipcRenderer.invoke('sqs:start', params),

  stop: () => ipcRenderer.invoke('sqs:stop'),

  onMessages: (callback: (messages: unknown[]) => void) => {
    ipcRenderer.on('sqs:messages', (_event, messages) => callback(messages))
    return () => ipcRenderer.removeAllListeners('sqs:messages')
  },

  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('sqs:error', (_event, error) => callback(error))
    return () => ipcRenderer.removeAllListeners('sqs:error')
  },
})
