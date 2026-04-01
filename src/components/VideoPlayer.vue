<script setup lang="ts">
import { Pause, Play } from '@lucide/vue'
import { ref } from 'vue'

interface Props {
  src: string
  poster?: string
}

defineProps<Props>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)

const currentTime = ref(0)
const duration = ref(0)

function togglePlay() {
  if (!videoRef.value) return

  if (videoRef.value.paused) {
    videoRef.value.play()
    isPlaying.value = true
  } else {
    videoRef.value.pause()
    isPlaying.value = false
  }
}

const onTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

const onLoadedMetadata = () => {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (videoRef.value) {
    videoRef.value.currentTime = Number(target.value)
  }
}
</script>

<template>
  <div class="vp-container" @click="togglePlay">
    <video
      ref="videoRef"
      :src="src"
      :poster="poster"
      playsinline
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
    />

    <div class="vp-overlay" :class="{ 'is-playing': isPlaying }">
      <button class="vp-play-btn">
        <Pause v-if="isPlaying" :size="24" color="white" fill="white" />
        <Play v-else :size="24" color="white" fill="white" />
      </button>
    </div>

    <div class="vp-controller" @click.stop>
      <input
        type="range"
        min="0"
        :max="duration"
        step="0.1"
        :value="currentTime"
        @input="onInput"
        class="vp-range"
        :style="{ '--progress': (currentTime / duration) * 100 + '%' }"
      />
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
}

video {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  display: block;
}

/* Play button */
.vp-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.2);
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  pointer-events: none;
}

.vp-overlay.is-playing {
  opacity: 0;
  transform: scale(1.2);
}

.vp-play-btn {
  background: rgba(0, 0, 0, 0.4);
  border: none;
  border-radius: 50%;
  width: 3rem;
  height: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.vp-play-btn :deep(svg) {
  margin-left: 2px;
}

/* Controller */
.vp-controller {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 15px 10px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.5));
  z-index: 3;
}

/* Range */
.vp-range {
  appearance: none;
  width: 100%;
  background: transparent;
  cursor: pointer;
}

.vp-range::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  background-image: linear-gradient(to right, #fff var(--progress), transparent var(--progress));
}

.vp-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: #fff;
  margin-top: -4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s;
}

.vp-range:hover::-webkit-slider-thumb {
  transform: scale(1.2);
}

.vp-range::-moz-range-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
.vp-range::-moz-range-progress {
  background: #fff;
  height: 4px;
  border-radius: 2px;
}
</style>
