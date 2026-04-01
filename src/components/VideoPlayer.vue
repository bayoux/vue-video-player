<script setup lang="ts">
import { Pause, Play } from '@lucide/vue'
import { computed, onUnmounted, ref } from 'vue'

interface Props {
  src: string
  poster?: string
}

defineProps<Props>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const isDragging = ref(false)

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
  <div class="vp-container" @click="togglePlay">
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      playsinline
      @loadedmetadata="onLoadedMetadata"
      @ended="onVideoEnded"
    />

    <div class="vp-overlay" :class="{ 'is-playing': isPlaying }">
      <button class="vp-play-btn">
        <Pause v-if="isPlaying" :size="24" color="white" fill="white" />
        <Play v-else :size="24" color="white" fill="white" />
      </button>
    </div>

    <div class="vp-controller" :class="{ visible: !isPlaying || isDragging }" @click.stop>
      <div class="time-info">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>

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

        <div class="custom-track">
          <div
            class="progress-line"
            :class="{ 'no-transition': isDragging }"
            :style="{ width: progressPercent + '%' }"
          />
          <div
            class="custom-thumb"
            :class="{ 'no-transition': isDragging }"
            :style="{ left: progressPercent + '%' }"
          />
        </div>
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
  min-width: 20rem;
  background-color: #000;
  border-radius: 1rem;
  overflow: hidden;
  cursor: pointer;
}

video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Overlay & Central Button */
.vp-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  transition:
    opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.4s ease;
  pointer-events: none;
  z-index: 2;
}

.vp-overlay.is-playing {
  opacity: 0;
  transform: scale(1.1);
}

.vp-play-btn {
  background: rgba(255, 255, 255, 0.2);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  width: 4rem;
  height: 4rem;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Controller visibility logic */
.vp-controller {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 40px 20px 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
  z-index: 3;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.vp-container:hover .vp-controller,
.vp-controller.visible {
  opacity: 1;
  transform: translateY(0);
}

.time-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #fff;
  font-family: sans-serif;
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Custom Range Engine */
.range-wrapper {
  position: relative;
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
}

.vp-range-hidden {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 5;
}

.custom-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
}

.progress-line {
  height: 100%;
  background: #fff;
  border-radius: 2px;
  transition: width 0.2s linear;
}

.custom-thumb {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: left 0.2s linear;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-line,
.custom-thumb {
  transition: none;
}

.vp-container:not(.is-playing) .progress-line,
.vp-container:not(.is-playing) .custom-thumb {
  transition:
    width 0.1s ease,
    left 0.1s ease;
}

.no-transition {
  transition: none !important;
}

.range-wrapper:hover .custom-thumb {
  transform: translate(-50%, -50%) scale(1.3);
}
</style>
