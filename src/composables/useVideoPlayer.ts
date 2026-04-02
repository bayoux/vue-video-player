import { computed, onUnmounted, ref, type Ref } from 'vue'

export function useVideoPlayer(videoRef: Ref<HTMLVideoElement | null>) {
  const isPlaying = ref(false)
  const isDragging = ref(false)
  const isFullscreen = ref(false)
  const isLoading = ref(false)

  const currentTime = ref(0)
  const duration = ref(0)
  const animationFrameId = ref<number | null>(null)

  const volume = ref(1)
  const isMuted = ref(false)
  const previousVolume = ref(1)

  const playbackRate = ref(1)

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

  function toggleMute() {
    if (!videoRef.value) return

    if (isMuted.value) {
      volume.value = previousVolume.value || 1
      isMuted.value = false
    } else {
      previousVolume.value = volume.value
      volume.value = 0
      isMuted.value = true
    }

    videoRef.value.muted = isMuted.value
    videoRef.value.volume = volume.value
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
      setupBufferLogic()
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

  function onVolumeInput(e: Event) {
    const target = e.target as HTMLInputElement
    const val = parseFloat(target.value)
    volume.value = val

    if (videoRef.value) {
      videoRef.value.volume = val
      videoRef.value.muted = val === 0
      isMuted.value = val === 0
    }
  }

  function setPlaybackRate(rate: number) {
    if (!videoRef.value) return

    videoRef.value.playbackRate = rate
    playbackRate.value = rate
  }

  function setupBufferLogic() {
    if (!videoRef.value) return
    videoRef.value.onwaiting = () => (isLoading.value = true)
    videoRef.value.onplaying = () => (isLoading.value = false)
    videoRef.value.onpause = () => (isLoading.value = false)
  }

  function seek(amount: number) {
    if (!videoRef.value) return
    const newTime = videoRef.value.currentTime + amount
    videoRef.value.currentTime = Math.max(0, Math.min(newTime, duration.value))
    currentTime.value = videoRef.value.currentTime
  }

  function adjustVolume(amount: number) {
    if (!videoRef.value) return
    const newVolume = Math.max(0, Math.min(1, volume.value + amount))
    volume.value = newVolume
    videoRef.value.volume = newVolume
    isMuted.value = newVolume === 0
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    const isInput = ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
    if (isInput) return

    switch (e.code) {
      case 'Space':
      case 'KeyK':
        e.preventDefault()
        togglePlay()
        break
      case 'ArrowRight':
      case 'KeyL':
        e.preventDefault()
        seek(5) // Перемотка вперед на 5 сек
        break
      case 'ArrowLeft':
      case 'KeyJ':
        e.preventDefault()
        seek(-5) // Перемотка назад на 5 сек
        break
      case 'ArrowUp':
        e.preventDefault()
        adjustVolume(0.1) // Громкость +10%
        break
      case 'ArrowDown':
        e.preventDefault()
        adjustVolume(-0.1) // Громкость -10%
        break
      case 'KeyF':
        e.preventDefault()
        toggleFullscreen()
        break
      case 'KeyM':
        e.preventDefault()
        toggleMute()
        break
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
    volume,
    isMuted,
    playbackRate,
    isLoading,
    togglePlay,
    onStartDragging,
    onEndDragging,
    onVideoEnded,
    toggleFullscreen,
    onLoadedMetadata,
    onInput,
    toggleMute,
    onVolumeInput,
    setPlaybackRate,
    setupBufferLogic,
    handleKeyDown,
  }
}
