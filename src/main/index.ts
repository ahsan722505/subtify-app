import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'
import fs from 'fs'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

  console.log('hello')

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle('transcribe', async (_, filePath: string) => {
    return new Promise((resolve, reject) => {
      let executableName = ''
      switch (process.platform) {
        case 'win32':
          executableName = 'whisper-faster-windows.exe'
          break
        case 'darwin':
          executableName = 'whisper-faster-mac'
          break
        case 'linux':
          executableName = 'whisper-faster-linux'
          break
        default:
          reject('Unsupported platform')
          return
      }
      const whisperPath = join(is.dev ? '' : process.resourcesPath, 'Whisper-Faster')
      const executablePath = join(whisperPath, executableName)
      const processId = Math.floor(Math.random() * 1000000)
      const outputDir = join(app.getPath('userData'), processId.toString())
      fs.mkdirSync(outputDir, { recursive: true })
      const whisper = spawn(executablePath, [
        filePath,
        '-f',
        'json',
        '-o',
        outputDir,
        '--language',
        'en',
        '--model',
        'small',
        '--model_dir',
        join(whisperPath, '_models')
      ])
      whisper.on('close', (code) => {
        if (code === 0) {
          const files = fs.readdirSync(outputDir)
          if (files.length === 0) {
            reject('There was an error transcribing the file')
          }
          const data = fs.readFileSync(join(outputDir, files[0]), 'utf8')
          const jsonData = JSON.parse(data)
          resolve(
            jsonData.segments.map((seg) => ({ start: seg.start, end: seg.end, text: seg.text }))
          )
          fs.rm(outputDir, { recursive: true, force: true }, () => {})
        } else {
          reject('There was an error transcribing the file')
        }
      })
    })
  })

  ipcMain.handle('save-thumbnail', async (_, dataURL) => {
    try {
      const base64Data = dataURL.replace(/^data:image\/png;base64,/, '')
      const thumbnailsDir = join(app.getPath('userData'), 'thumbnails')

      // Ensure the thumbnails directory exists
      if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir)
      }

      const filePath = join(thumbnailsDir, `thumbnail-${Date.now()}.png`)
      fs.writeFileSync(filePath, base64Data, 'base64')
      return filePath
    } catch (error) {
      throw new Error('Failed to save thumbnail')
    }
  })

  ipcMain.handle('delete-thumbnail', async (_, thumbnailPath) => {
    try {
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath)
        return
      }
      throw new Error('File does not exist')
    } catch (error) {
      throw new Error('Failed to delete thumbnail')
    }
  })

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
