import useAppStore, { AppUpdatesLifecycle } from '@renderer/store/store'
import { Progress } from 'antd'

export default function AppUpdates(): JSX.Element {
  const appUpdateStatus = useAppStore((state) => state.appUpdateStatus)
  const downloadedUpdatesPercentage = useAppStore((state) => state.downloadedUpdatesPercentage)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">App Updates</h1>
      {appUpdateStatus === AppUpdatesLifecycle.Checking && (
        <h1 className="text-xl">Checking for updates....</h1>
      )}
      {appUpdateStatus === AppUpdatesLifecycle.UPTODATE && (
        <h1 className="text-xl">Your app is up to date</h1>
      )}
      {appUpdateStatus === AppUpdatesLifecycle.DOWNLOADING && (
        <div>
          <h1>Downloading updates please do not close the app....</h1>
          <Progress percent={downloadedUpdatesPercentage} status="active" />
        </div>
      )}
      {appUpdateStatus === AppUpdatesLifecycle.DOWNLOADED && (
        <h1 className="text-xl">
          Updates downloaded successfully. Kindly quit the app to finish installation process.
        </h1>
      )}
    </div>
  )
}
