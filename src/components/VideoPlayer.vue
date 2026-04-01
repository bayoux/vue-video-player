<script setup lang="ts">
import { Maximize, Minimize, Pause, Play } from '@lucide/vue'
import { ref } from 'vue'
import VideoRange from './VideoRange.vue'
import { useVideoPlayer } from '../composables/useVideoPlayer'
import { formatTime } from '../utils'

interface Props {
  src: string
  poster?: string
}

defineProps<Props>()

const videoRef = ref<HTMLVideoElement | null>(null)

const {
  isPlaying,
  isFullscreen,
  currentTime,
  duration,
  progressPercent,
  isDragging,
  togglePlay,
  toggleFullscreen,
  onLoadedMetadata,
  onVideoEnded,
  onInput,
  onStartDragging,
  onEndDragging,
} = useVideoPlayer(videoRef)
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
      <VideoRange
        :currentTime="currentTime"
        :duration="duration"
        :progressPercent="progressPercent"
        @on-input="onInput"
        @on-start-dragging="onStartDragging"
        @on-end-dragging="onEndDragging"
      />

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
