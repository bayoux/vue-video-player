<script setup lang="ts">
import { ref, onUnmounted, nextTick } from 'vue'

interface Props {
  playbackRate: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'set-speed', value: number): void
}>()

const showSpeedMenu = ref(false)
const speedMenuRef = ref<HTMLElement | null>(null)
const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2]

const closeSpeedMenu = (e: Event) => {
  if (showSpeedMenu.value && speedMenuRef.value && !speedMenuRef.value.contains(e.target as Node)) {
    showSpeedMenu.value = false
    window.removeEventListener('click', closeSpeedMenu)
  }
}

const toggleSpeedMenu = async () => {
  showSpeedMenu.value = !showSpeedMenu.value

  if (showSpeedMenu.value) {
    await nextTick()
    window.addEventListener('click', closeSpeedMenu)
  } else {
    window.removeEventListener('click', closeSpeedMenu)
  }
}

const selectSpeed = (speed: number) => {
  emit('set-speed', speed)
  showSpeedMenu.value = false
  window.removeEventListener('click', closeSpeedMenu)
}

onUnmounted(() => {
  window.removeEventListener('click', closeSpeedMenu)
})
</script>

<template>
  <div class="speed-control">
    <button class="speed-btn" :class="{ 'is-active': showSpeedMenu }" @click.stop="toggleSpeedMenu">
      <span>{{ playbackRate }}x</span>
    </button>

    <Transition name="fade">
      <div v-if="showSpeedMenu" ref="speedMenuRef" class="speed-menu" @click.stop>
        <div
          v-for="speed in speedOptions"
          :key="speed"
          class="speed-item"
          :class="{ active: playbackRate === speed }"
          @click="selectSpeed(speed)"
        >
          {{ speed }}x
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.speed-control {
  position: relative;
  display: flex;
  align-items: center;
}

.speed-btn {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0.8;
  transition: all 0.2s ease;
  min-width: 44px;
  border-radius: 4px;
}

.speed-btn:hover,
.speed-btn.is-active {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.speed-menu {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(28, 28, 28, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 6px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.speed-menu::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: rgba(28, 28, 28, 0.9) transparent transparent transparent;
}

.speed-item {
  padding: 8px 16px;
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 6px;
  text-align: center;
  transition: background 0.2s;
}

.speed-item:hover {
  background: rgba(255, 255, 255, 0.15);
}

.speed-item.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  font-weight: 700;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(10px);
}
</style>
