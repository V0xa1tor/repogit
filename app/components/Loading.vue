<template>
  <div class="d-flex justify-content-center">
    <div class="cube-container">
      <div class="cube">
        <div class="face top"></div>
        <div class="face bottom"></div>
        <div class="face left"></div>
        <div class="face right"></div>
        <div class="face front"></div>
        <div class="face back"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes turn {
  from { transform: rotate3d(1, 1, 1, 0deg); }
  15% { transform: rotate3d(0, 1, 0, 360deg); }
  30% { transform: rotate3d(0, 1, 0, 0deg); }
  45% { transform: rotate3d(1, 0, 0, 360deg); }
  60% { transform: rotate3d(1, 0, 0, 0deg); }
  75% { transform: rotate3d(0, 0, 1, 360deg); }
  90% { transform: rotate3d(0, 0, 1, 0deg); }
  to { transform: rotate3d(1, 1, 1, 360deg); }
}

.cube-container {
  width: 100px;
  height: 100px;
  perspective: 500px;
  margin: 100px;
}

.cube {
  position: relative;
  width: 100px;
  height: 100px;
  transform-style: preserve-3d;
  animation: turn 20s ease-in-out infinite;
}

.face {
  width: 100px;
  height: 100px;
  background: var(--bs-body-color);
  /* border: 1px solid var(--bs-border-color); */
  position: absolute;
  opacity: 0.1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 500ms;
}

.front {
  transform: translateZ(100px);
}

.back {
  transform: translateZ(-100px) rotateY(180deg);
}

.left {
  transform: translateX(-100px) rotateY(-90deg);
}

.right {
  transform: translateX(100px) rotateY(90deg);
}

.top {
  transform: translateY(-100px) rotateX(90deg);
}

.bottom {
  transform: translateY(100px) rotateX(-90deg);
}

@media (prefers-reduced-motion: reduce) {
  .cube {
    animation: none;
    transform: rotate3d(1, 1, 0, 45deg);
  }
}
</style>