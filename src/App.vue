<script setup lang="ts">
import VideoPlayer from './components/VideoPlayer.vue'
</script>

<template>
  <div class="main-layout">
    <div class="container">
      <VideoPlayer src="/ls.mp4" />
      <VideoPlayer src="/hs.mp4" />
    </div>
  </div>
</template>

<style scoped>
.main-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.container {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
  align-items: center;
}

.container > * {
  flex: 1;
  height: 100%;
  min-width: 0;
}
</style>
