import { computed, onUnmounted, ref, type Ref } from 'vue'

export function useVideoPlayer(videoRef: Ref<HTMLVideoElement | null>) {
  const isPlaying = ref(false)
  const isDragging = ref(false)
  const isFullscreen = ref(false)

  const currentTime = ref(0)
  const duration = ref(0)
  const animationFrameId = ref<number | null>(null)

  const progressPercent = computed(() => {
    return duration.value ? (currentTime.value / duration.value) * 100 : 0
  })

  function updateSmoothProgress() {
    if (videoRef.value && !isDragging.value && isPlaying.value) {
      const time = videoRef.value.currentTime
      currentTime.value = time

      if (time >= duration.value) {
        onVideoEnded()
        return
      }

      if (animationFrameId.value) cancelAnimationFrame(animationFrameId.value)

      animationFrameId.value = requestAnimationFrame(updateSmoothProgress)
    }
  }

  function togglePlay() {
    if (!videoRef.value) return

    if (videoRef.value.paused) {
      videoRef.value.play()
      isPlaying.value = true

      updateSmoothProgress()
    } else {
      videoRef.value.pause()
      isPlaying.value = false

      if (animationFrameId.value) {
        cancelAnimationFrame(animationFrameId.value)
      }
    }
  }

  function onStartDragging() {
    isDragging.value = true
  }

  function onEndDragging() {
    isDragging.value = false

    if (isPlaying.value) {
      updateSmoothProgress()
    }
  }

  function onVideoEnded() {
    isPlaying.value = false
    currentTime.value = duration.value

    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
      animationFrameId.value = null
    }
  }

  async function toggleFullscreen() {
    if (!videoRef.value) return

    const container = videoRef.value.parentElement

    if (!document.fullscreenElement) {
      try {
        await container?.requestFullscreen()
        isFullscreen.value = true
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err}`)
      }

      return
    }

    document.exitFullscreen()
    isFullscreen.value = false
  }

  function onLoadedMetadata() {
    if (videoRef.value) {
      duration.value = videoRef.value.duration
    }
  }

  function onInput(e: Event) {
    const target = e.target as HTMLInputElement
    const value = Number(target.value)
    currentTime.value = value

    if (videoRef.value) {
      videoRef.value.currentTime = Number(target.value)
    }
  }

  if (typeof document !== 'undefined') {
    document.onfullscreenchange = () => {
      isFullscreen.value = !!document.fullscreenElement
    }
  }

  onUnmounted(() => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
    }
  })

  return {
    isPlaying,
    isDragging,
    isFullscreen,
    currentTime,
    duration,
    progressPercent,
    togglePlay,
    onStartDragging,
    onEndDragging,
    onVideoEnded,
    toggleFullscreen,
    onLoadedMetadata,
    onInput,
  }
}
