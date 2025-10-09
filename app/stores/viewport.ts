export const useViewportStore = defineStore("viewport", () => {
  const windowWidth = ref(0);
  const windowHeight = ref(0);

  const isLandscape = computed(() => (windowWidth.value >= windowHeight.value));
  const isPortrait = computed(() => (windowWidth.value < windowHeight.value));

  function updateWindowSize() {
    windowWidth.value = window.innerWidth;
    windowHeight.value = window.innerHeight;
  }

  return { windowWidth, windowHeight, isLandscape, isPortrait, updateWindowSize };
});
