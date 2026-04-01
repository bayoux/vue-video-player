<script setup lang="ts">
import { Maximize, Minimize, Pause, Play } from '@lucide/vue'
import { computed, onUnmounted, ref } from 'vue'

interface Props {
  src: string
  poster?: string
}

defineProps<Props>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isDragging = ref(false)
const isFullscreen = ref(false)

const currentTime = ref(0)
const duration = ref(0)
const animationFrameId = ref<number | null>(null)

const progressPercent = computed(() => {
  return duration.value ? (currentTime.value / duration.value) * 100 : 0
})

onUnmounted(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})

if (typeof document !== 'undefined') {
  document.onfullscreenchange = () => {
    isFullscreen.value = !!document.fullscreenElement
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

const onStartDragging = () => (isDragging.value = true)

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

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  const parts = [
    h > 0 ? h : null,
    (h > 0 && m < 10 ? '0' : '') + m,
    (s < 10 ? '0' : '') + s,
  ].filter(Boolean)

  return parts.join(':')
}
</script>

<template>
  <div class="vp-container" @click="togglePlay" :class="{ 'is-fullscreen': isFullscreen }">
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      playsinline
      @loadedmetadata="onLoadedMetadata"
      @ended="onVideoEnded"
    />

    <div class="vp-overlay" :class="{ 'is-playing': isPlaying }">
      <div class="vp-play-btn">
        <Play v-if="!isPlaying" :size="30" color="white" fill="white" />
        <Pause v-else :size="30" color="white" fill="white" />
      </div>
    </div>

    <div class="vp-controller" :class="{ visible: !isPlaying || isDragging }" @click.stop>
      <div class="range-wrapper">
        <input
          type="range"
          min="0"
          :max="duration"
          step="0.01"
          :value="currentTime"
          @input="onInput"
          @mousedown="onStartDragging"
          @mouseup="onEndDragging"
          @touchstart="onStartDragging"
          @touchend="onEndDragging"
          @change="onEndDragging"
          class="vp-range-hidden"
        />

        <div class="custom-track-container">
          <div class="custom-track">
            <div class="progress-line" :style="{ width: progressPercent + '%' }" />
            <div class="custom-thumb" :style="{ left: progressPercent + '%' }" />
          </div>
        </div>
      </div>

      <div class="controls-row">
        <div class="time-block">
          <span class="current">{{ formatTime(currentTime) }}</span>
          <span class="divider">/</span>
          <span class="total">{{ formatTime(duration) }}</span>
        </div>

        <button class="fullscreen-btn" @click="toggleFullscreen">
          <Minimize v-if="isFullscreen" :size="20" color="white" stroke-width="2.5" />
          <Maximize v-else :size="20" color="white" stroke-width="2.5" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.vp-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  border-radius: 12px;
  overflow: hidden;
  user-select: none;
}

video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.vp-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.1);
  transition: all 0.4s cubic-bezier(0.2, 0, 0.2, 1);
  z-index: 2;
  pointer-events: none;
}

.vp-overlay.is-playing {
  opacity: 0;
  transform: scale(1.1);
}

.vp-play-btn {
  width: 72px;
  height: 72px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.vp-controller {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 16px 12px;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 60%,
    transparent 100%
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 3;
  opacity: 0;
  transform: translateY(5px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.vp-container:hover .vp-controller,
.vp-controller.visible {
  opacity: 1;
  transform: translateY(0);
}

.range-wrapper {
  position: relative;
  width: 100%;
  height: 12px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.custom-track-container {
  width: 100%;
  padding: 4px 0;
}

.custom-track {
  width: 100%;
  height: 3px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 2px;
  position: relative;
  transition: height 0.15s ease;
}

.range-wrapper:hover .custom-track {
  height: 5px;
}

.progress-line {
  height: 100%;
  background: #fff;
  border-radius: 2px;
  position: absolute;
}

.custom-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.15s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}

.range-wrapper:hover .custom-thumb,
.vp-range-hidden:active ~ .custom-track .custom-thumb {
  transform: translate(-50%, -50%) scale(1);
}

.vp-range-hidden {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 5;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
}

.time-block {
  display: flex;
  gap: 4px;
  align-items: center;
  color: #fff;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.9;
}

.time-block .divider {
  opacity: 0.5;
  font-size: 11px;
}

.fullscreen-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  padding: 2px;
  opacity: 0.75;
  transition: opacity 0.2s;
}

.fullscreen-btn:hover {
  opacity: 1;
}

.is-fullscreen {
  border-radius: 0;
}
</style>
