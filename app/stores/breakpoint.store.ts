// /stores/useBreakpointStore.ts
import { defineStore } from 'pinia'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export const useBreakpointStore = defineStore('breakpoint', () => {
  // 📏 valores baseados nos breakpoints do Bootstrap 5
  const sm = 576
  const md = 768
  const lg = 992
  const xl = 1200
  const xxl = 1400

  const width = ref<number>(window.innerWidth)

  const isSm = computed(() => width.value >= sm && width.value < md)
  const isMd = computed(() => width.value >= md && width.value < lg)
  const isLg = computed(() => width.value >= lg && width.value < xl)
  const isXl = computed(() => width.value >= xl && width.value < xxl)
  const isXxl = computed(() => width.value >= xxl)

  // também dá pra ter flags acumulativas
  const isSmUp = computed(() => width.value >= sm)
  const isMdUp = computed(() => width.value >= md)
  const isLgUp = computed(() => width.value >= lg)
  const isXlUp = computed(() => width.value >= xl)

  // listener de resize
  const updateWidth = () => (width.value = window.innerWidth)

  onMounted(() => window.addEventListener('resize', updateWidth))
  onBeforeUnmount(() => window.removeEventListener('resize', updateWidth))

  return {
    width,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    isSmUp,
    isMdUp,
    isLgUp,
    isXlUp,
  }
})
