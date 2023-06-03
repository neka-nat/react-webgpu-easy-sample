import { useEffect, useState } from "react"
import { useDevice } from "./useDevice"

export const useWebGPU = (canvas: HTMLCanvasElement | null | undefined) => {

  const [context, setContext] = useState<GPUCanvasContext>()
  const [format, setFormat] = useState<GPUTextureFormat>('rgba8unorm')
  const { adapter, device } = useDevice()

  useEffect(() => {
    if (!canvas || !adapter) return
      const context = canvas.getContext('webgpu')

      if (context === null) return
      setContext(context)

      const preferredFormat = navigator.gpu.getPreferredCanvasFormat();
      setFormat(preferredFormat)
  }, [canvas, adapter])

  return { canvas, context, format, adapter, device }
}
