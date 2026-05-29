// 视频预览组件
interface VideoPreviewProps {
  url: string
  onLoad?: () => void
}

export function VideoPreview({ url, onLoad }: VideoPreviewProps) {
  return (
    <div className="w-full max-w-4xl bg-black rounded-lg overflow-hidden shadow-2xl">
      <video
        src={url}
        controls
        className="w-full"
        autoPlay
        onLoadedData={onLoad}
      >
        您的浏览器不支持视频播放
      </video>
    </div>
  )
}