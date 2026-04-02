<script setup lang="ts">
import { Maximize, Minimize, Pause, Play, Volume1, Volume2, VolumeX } from '@lucide/vue'
import { ref } from 'vue'
import VideoRange from './VideoRange.vue'
import { useVideoPlayer } from '../composables/useVideoPlayer'
import { formatTime } from '../utils'
import VideoSpeedControl from './VideoSpeedControl.vue'

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
  volume,
  isMuted,
  playbackRate,
  isLoading,
  togglePlay,
  toggleFullscreen,
  onLoadedMetadata,
  onVideoEnded,
  onInput,
  onStartDragging,
  onEndDragging,
  toggleMute,
  onVolumeInput,
  setPlaybackRate,
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

    <div v-if="isLoading" class="vp-loader">
      <div class="spinner"></div>
    </div>

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
        <div class="left-controls">
          <div class="time-block">
            <span class="current">{{ formatTime(currentTime) }}</span>
            <span class="divider">/</span>
            <span class="total">{{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="right-controls">
          <VideoSpeedControl :playback-rate="playbackRate" @set-speed="setPlaybackRate" />

          <div class="volume-control">
            <button class="mute-btn" @click="toggleMute">
              <VolumeX v-if="isMuted || volume === 0" :size="20" color="white" />
              <Volume1 v-else-if="volume < 0.5" :size="20" color="white" />
              <Volume2 v-else :size="20" color="white" />
            </button>
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.05"
              :value="volume"
              @input="onVolumeInput"
              :style="{ '--volume-percent': `${volume * 100}%` }"
            />
          </div>

          <button class="fullscreen-btn" @click="toggleFullscreen">
            <Minimize v-if="isFullscreen" :size="20" color="white" />
            <Maximize v-else :size="20" color="white" />
          </button>
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

.right-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mute-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  opacity: 0.8;
}

.mute-btn:hover {
  opacity: 1;
}

.volume-slider {
  width: 0;
  opacity: 0;
  transition:
    width 0.2s,
    opacity 0.2s;
  cursor: pointer;
  height: 4px;
  appearance: none;
  background: linear-gradient(
    to right,
    #fff 0%,
    #fff var(--volume-percent),
    rgba(255, 255, 255, 0.3) var(--volume-percent),
    rgba(255, 255, 255, 0.3) 100%
  );
  border-radius: 2px;
}

.volume-control:hover .volume-slider {
  width: 60px;
  opacity: 1;
}

.volume-slider::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 2px;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  margin-top: -4px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
}

.volume-slider::-moz-range-track {
  height: 4px;
  background: transparent;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #fff;
  border: none;
  border-radius: 50%;
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

.vp-loader {
  position: absolute;
  z-index: 5;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
