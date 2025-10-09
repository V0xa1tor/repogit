<script setup lang="ts">

const loading = ref(true);
const viewport = useViewportStore();

onMounted(async () => {
  viewport.updateWindowSize();
  window.addEventListener('resize', viewport.updateWindowSize);

  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', setAppHeight);
  setAppHeight();

  useRepositoryStore().loadRepositories();

  await sleep(200);
  loading.value = false;
});

function setAppHeight() {
  const height = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
}

</script>

<template>

  <NuxtPwaManifest />

  <div v-if="loading"
    class="position-fixed bg-body w-100 h-100 d-flex justify-content-center align-items-center"
    style="z-index: 9999;"
  >
    <Loading />
  </div>

  <div class="d-flex flex-column-reverse flex-md-row h-100 overflow-auto">
    <ActionMenu /> <!-- Side / Bottom -->
    <!-- <div class="vr" style="color: var(--bs-border-color); opacity: 1;"></div> -->
    <div class="hstack w-100 h-100 overflow-auto">
      <SidePanel />
      <div class="vstack" style="width: 1%;">
        <!-- <TopBar2 /> -->
        <TopBar />
        <NuxtPage class="overflow-auto" />
      </div>
    </div>
  </div>
  
</template>

<style>
html, body, #__nuxt {
  width: 100dvw;
  height: var(--app-height);
}
</style>