import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { spawn } from 'child_process'
import fs from 'fs'
import { autoUpdater } from 'electron-updater'
import srtParser2 from 'srt-parser-2'
import os from 'os'
import * as Sentry from '@sentry/electron/main'

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://2c09d9da66302a00214fa0df138c0c22@o4507633186701312.ingest.de.sentry.io/4507633225433168',
    maxValueLength: 100000
  })
}

let win: BrowserWindow | null = null

enum AppUpdatesLifecycle {
  Checking = 'checking',
  UPTODATE = 'up-to-date',
  DOWNLOADING = 'downloading',
  DOWNLOADED = 'downloaded'
}
type Subtitle = {
  start: number
  end: number
  text: string
  id: string
}
type SubtitleGenerationProgressPayload = {
  type: 'progress' | 'completed' | 'error'
  projectId: IDBValidKey
  subtitles?: Subtitle[]
  duration?: number
}

function hmsToSecondsOnly(str: string): number {
  const p = str.split(':')
  let s = 0
  let m = 1

  while (p.length > 0) {
    s += m * parseInt(p.pop()!, 10)
    m *= 60
  }

  return s
}

function sendSubtitleGenerationProgress(payload: SubtitleGenerationProgressPayload): void {
  win?.webContents.send('subtitle-generation-progress', payload)
}

function generateUniqueId(): string {
  return Math.random().toString(16).slice(2)
}

function sendUpdatesStatusToWindow(status: AppUpdatesLifecycle): void {
  win?.webContents.send('update-status', status)
}

autoUpdater.on('update-not-available', () => {
  sendUpdatesStatusToWindow(AppUpdatesLifecycle.UPTODATE)
})

autoUpdater.on('download-progress', (progressObj) => {
  sendUpdatesStatusToWindow(AppUpdatesLifecycle.DOWNLOADING)
  win?.webContents.send('downloaded-updates-percentage', progressObj.percent)
})
autoUpdater.on('update-downloaded', () => {
  sendUpdatesStatusToWindow(AppUpdatesLifecycle.DOWNLOADED)
})

function createWindow(): void {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  const mainWindow = new BrowserWindow({
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false
    }
  })

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

  setTimeout(() => {
    if (is.dev) sendUpdatesStatusToWindow(AppUpdatesLifecycle.UPTODATE)
    else autoUpdater.checkForUpdatesAndNotify()
  }, 5000)

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    win = window
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.handle(
    'add-subtitle-stream',
    async (
      _,
      data: {
        filePath: string
        subtitleMetadata: { text: string; type: string }
        mediaType: string
      }
    ) => {
      return new Promise((resolve, reject) => {
        const { filePath, subtitleMetadata, mediaType } = data
        const isWebm = mediaType === 'video/webm'

        const ffmpegPath = join(
          is.dev ? '' : process.resourcesPath,
          'ffmpeg',
          process.platform,
          'ffmpeg'
        )

        const processId = Math.floor(Math.random() * 1000000)

        const inputPath = join(
          app.getPath('userData'),
          processId.toString(),
          `subtitles.${subtitleMetadata.type}`
        )
        fs.mkdirSync(join(app.getPath('userData'), processId.toString()), { recursive: true })
        fs.writeFileSync(inputPath, subtitleMetadata.text)

        const outputPath = join(
          app.getPath('downloads'),
          `subtify-${processId}.${isWebm ? 'webm' : 'mp4'}`
        )

        const args = [
          '-i',
          filePath,
          '-i',
          inputPath,
          '-c',
          'copy',
          '-c:s',
          isWebm ? 'webvtt' : 'mov_text',
          outputPath
        ]

        const ffmpeg = spawn(ffmpegPath, args)
        let logs = ''
        ffmpeg.stdout.on('data', (data) => {
          console.log(data.toString())
          logs += data.toString()
        })
        ffmpeg.stderr.on('data', (data) => {
          console.log(data.toString())
          logs += data.toString()
        })
        ffmpeg.on('close', (code) => {
          if (code === 0) {
            resolve(outputPath)
          } else {
            Sentry.captureException(new Error(logs))
            reject('There was an error adding the subtitle stream')
          }
          fs.rm(
            join(app.getPath('userData'), processId.toString()),
            { recursive: true, force: true },
            () => {}
          )
        })
      })
    }
  )

  ipcMain.handle(
    'transcribe',
    async (
      _,
      data: {
        filePath: string
        language: string | null
        translate: boolean
        projectId: IDBValidKey
      }
    ) => {
      const { filePath, language, translate, projectId } = data
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
          return
      }
      const whisperPath = join(is.dev ? '' : process.resourcesPath, 'Whisper-Faster')
      const executablePath = join(whisperPath, executableName)
      const processId = Math.floor(Math.random() * 1000000)
      const outputDir = join(app.getPath('userData'), processId.toString())
      fs.mkdirSync(outputDir, { recursive: true })
      const args = [
        filePath,
        '-f',
        'srt',
        '-o',
        outputDir,
        '--model',
        'small',
        '--device',
        'cpu',
        '--sentence',
        '--max_line_width',
        '42',
        '--model_dir',
        join(whisperPath, '_models')
      ]
      if (language) args.push('--language', language)
      if (translate && language !== 'English') args.push('--task', 'translate')
      const whisper = spawn(executablePath, args)
      let logs = ''
      whisper.stderr.on('data', (data) => {
        logs += data.toString()
      })
      whisper.stdout.on('data', (data) => {
        const str = data.toString()
        logs += str
        const duration = str.slice(1, str.indexOf(']')).split('-->')[1]?.trim()
        const seconds = hmsToSecondsOnly(duration || '')
        if (seconds)
          sendSubtitleGenerationProgress({
            projectId,
            type: 'progress',
            duration: hmsToSecondsOnly(duration)
          })
      })
      whisper.on('close', (code) => {
        if (code === 0) {
          const files = fs.readdirSync(outputDir)
          if (files.length === 0) {
            Sentry.captureException(new Error(logs))
            sendSubtitleGenerationProgress({ projectId, type: 'error' })
            return
          }
          const data = fs.readFileSync(join(outputDir, files[0]), 'utf8')
          const parser = new srtParser2()
          const srt_array = parser.fromSrt(data)
          sendSubtitleGenerationProgress({
            projectId,
            type: 'completed',
            subtitles: srt_array.map((s) => ({
              start: s.startSeconds,
              end: s.endSeconds,
              text: s.text,
              id: generateUniqueId()
            }))
          })
          fs.rm(outputDir, { recursive: true, force: true }, () => {})
        } else {
          Sentry.captureException(new Error(logs))
          sendSubtitleGenerationProgress({ projectId, type: 'error' })
        }
      })
    }
  )

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

  ipcMain.handle(
    'save-subtitle-image',
    async (_, dataURL: string, exportId: string, imageNumber: number) => {
      return new Promise((res, rej) => {
        const base64Data = dataURL.replace(/^data:image\/png;base64,/, '')
        const exportDir = join(app.getPath('userData'), `export-${exportId}`)
        if (!fs.existsSync(exportDir)) {
          fs.mkdirSync(exportDir)
        }
        const filePath = join(exportDir, `${imageNumber}.png`)
        fs.writeFile(filePath, base64Data, 'base64', (err) => {
          if (err) {
            rej()
          } else {
            res(`image ${imageNumber} saved successfully`)
          }
        })
      })
    }
  )

  ipcMain.handle(
    'burn-subtitles',
    async (_, subtitles: Subtitle[], exportId: string, videoPath: string) => {
      return new Promise((resolve, reject) => {
        let filterComplex = ''
        const inputs: string[] = []

        // Prepare FFmpeg input files and filter complex string
        for (let index = 0; index < subtitles.length; index++) {
          const imageFile = join(app.getPath('userData'), `export-${exportId}`, `${index + 1}.png`)
          inputs.push(`-i ${imageFile}`)
          const subtitle = subtitles[index]

          // Define the overlay filter for each subtitle
          if (index === 0) {
            filterComplex += `[0][1]overlay=enable='between(t,${subtitle.start},${subtitle.end})':x=0:y=0[out];`
            continue
          }
          if (index === subtitles.length - 1) {
            filterComplex += `[out][${index + 1}]overlay=enable='between(t,${subtitle.start},${subtitle.end})':x=0:y=0`
            continue
          }

          filterComplex += `[out][${index + 1}]overlay=enable='between(t,${subtitle.start},${subtitle.end})':x=0:y=0[out];`
        }

        const outputPath = join(app.getPath('downloads'), `subtify-${exportId}.mp4`)

        const args = [
          '-i',
          videoPath,
          ...inputs.join(' ').split(' '),
          '-filter_complex',
          filterComplex,
          outputPath
        ]

        const ffmpegPath = join(
          is.dev ? '' : process.resourcesPath,
          'ffmpeg',
          process.platform,
          'ffmpeg'
        )
        const ffmpeg = spawn(ffmpegPath, args)
        let logs = ''
        ffmpeg.stdout.on('data', (data) => {
          console.log(data.toString())
          logs += data.toString()
        })
        ffmpeg.stderr.on('data', (data) => {
          console.log(data.toString())
          logs += data.toString()
        })
        ffmpeg.on('close', (code) => {
          if (code === 0) {
            resolve(outputPath)
          } else {
            Sentry.captureException(new Error(logs))
            reject('There was an error exporting the video')
          }
          fs.rm(
            join(app.getPath('userData'), `export-${exportId}`),
            { recursive: true, force: true },
            () => {}
          )
        })
      })
    }
  )

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

  ipcMain.handle('get-system-info', async () => {
    const { totalmem, freemem } = os
    const totalMemoryGb = (totalmem() / 1024 / 1024 / 1024).toFixed(1) + ' GB'
    const freeMemoryGb = (freemem() / 1024 / 1024 / 1024).toFixed(1) + ' GB'
    return {
      totalMemory: totalMemoryGb,
      freeMemory: freeMemoryGb,
      platform: os.platform(),
      kernalVersion: os.version(),
      osRelease: os.release(),
      cpuModel: os.cpus()[0]?.model,
      architecture: os.arch(),
      logicalCores: os.cpus().length
    }
  })

  ipcMain.handle('open-link', (_, link: string) => {
    shell.openExternal(link)
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
