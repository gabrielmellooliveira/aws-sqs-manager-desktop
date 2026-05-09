import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import { join } from 'path'
import {
  SQSClient,
  ReceiveMessageCommand,
  GetQueueAttributesCommand,
} from '@aws-sdk/client-sqs'

let mainWindow: BrowserWindow | null = null
let pollingInterval: NodeJS.Timeout | null = null
let sqsClient: SQSClient | null = null

function createWindow() {
  const icon = nativeImage.createFromPath(join(__dirname, '../assets/icon.png'))

  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0f1117',
    icon,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.maximize()

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

function getRegionFromArn(arn: string): string {
  // arn:aws:sqs:<region>:<account>:<queue-name>
  const parts = arn.split(':')
  return parts[3] || 'us-east-1'
}

function arnToQueueUrl(arn: string): string {
  // arn:aws:sqs:<region>:<account-id>:<queue-name>
  const parts = arn.split(':')
  if (parts.length < 6) return arn
  const region = parts[3]
  const accountId = parts[4]
  const queueName = parts[5]
  return `https://sqs.${region}.amazonaws.com/${accountId}/${queueName}`
}

function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

async function pollMessages(queueUrl: string) {
  if (!sqsClient) return

  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 2,
      AttributeNames: ['All'],
      MessageAttributeNames: ['All'],
    })

    const response = await sqsClient.send(command)
    const messages = response.Messages || []

    console.log(`[SQS] Poll: ${messages.length} mensagem(ns) recebida(s)`)

    if (messages.length > 0 && mainWindow) {
      mainWindow.webContents.send('sqs:messages', messages)
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[SQS] Erro no polling: ${msg}`)
    if (mainWindow) {
      mainWindow.webContents.send('sqs:error', msg)
    }
  }
}

ipcMain.handle('sqs:start', async (_event, { arn, region, accessKeyId, secretAccessKey }) => {
  stopPolling()

  const resolvedRegion = region || getRegionFromArn(arn)
  const queueUrl = arn.startsWith('arn:') ? arnToQueueUrl(arn) : arn

  sqsClient = new SQSClient({
    region: resolvedRegion,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  })

  // Validate queue exists
  try {
    await sqsClient.send(
      new GetQueueAttributesCommand({
        QueueUrl: queueUrl,
        AttributeNames: ['QueueArn'],
      })
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    return { success: false, error: msg }
  }

  pollingInterval = setInterval(() => pollMessages(queueUrl), 3000)
  await pollMessages(queueUrl)

  return { success: true, queueUrl }
})

ipcMain.handle('sqs:stop', () => {
  stopPolling()
  sqsClient = null
  return { success: true }
})

app.whenReady().then(() => {
  const icon = nativeImage.createFromPath(join(__dirname, '../assets/icon.png'))
  if (app.dock) app.dock.setIcon(icon)
  createWindow()
})

app.on('window-all-closed', () => {
  stopPolling()
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
