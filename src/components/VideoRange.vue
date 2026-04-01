<script setup lang="ts">
defineProps<{
  currentTime: number
  duration: number
  progressPercent: number
}>()

const emit = defineEmits<{
  (e: 'on-input', data: Event): void
  (e: 'on-start-dragging'): void
  (e: 'on-end-dragging'): void
}>()
</script>

<template>
  <div class="range-wrapper">
    <input
      type="range"
      min="0"
      :max="duration"
      step="0.01"
      :value="currentTime"
      @input="emit('on-input', $event)"
      @mousedown="emit('on-start-dragging')"
      @mouseup="emit('on-end-dragging')"
      @touchstart="emit('on-start-dragging')"
      @touchend="emit('on-end-dragging')"
      @change="emit('on-end-dragging')"
      class="vp-range-hidden"
    />

    <div class="custom-track-container">
      <div class="custom-track">
        <div class="progress-line" :style="{ width: progressPercent + '%' }" />
        <div class="custom-thumb" :style="{ left: progressPercent + '%' }" />
      </div>
    </div>
  </div>
</template>

<style scoped>
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
</style>
