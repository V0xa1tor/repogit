<script setup lang="ts">
import { Database } from '~/models/Database';

let pressTimer: NodeJS.Timeout;
let intervalTimer: NodeJS.Timeout;
let repogitIcon: HTMLElement;
let duration = 1;

onMounted(() => {
repogitIcon = document.getElementById("repogit-icon")!;

// Desktop (mouse)
repogitIcon.addEventListener("mousedown", startPress);
repogitIcon.addEventListener("mouseup", cancelPress);
repogitIcon.addEventListener("mouseleave", cancelPress);

// Mobile (toque)
repogitIcon.addEventListener("touchstart", startPress);
repogitIcon.addEventListener("touchend", cancelPress);
repogitIcon.addEventListener("touchcancel", cancelPress);
});

function startPress() {
  navigator.vibrate([
    100,100, 100,100, 100,100,
    100,50, 100,50, 100,50, 100,50, 100,50, 100,50, 100,50,
    100,10, 100,10, 100,10, 100,10, 100,10, 100,10, 100,10, 100,10, 100,10, 100,10, 100,10, 100,10
  ]);
  duration = 1; // reset
  repogitIcon.classList.add("shake");
  repogitIcon.style.animationDuration = `${duration}s`;

  // diminui a duração gradualmente até no máximo 0.3s
  intervalTimer = setInterval(() => {
    if (duration >= 0.2) {
      duration -= 0.1;
      repogitIcon.style.animationDuration = `${duration}s`;
    }
  }, 300);

  // inicia o timer de 3 segundos para a ação
  pressTimer = setTimeout(() => {
    navigateTo('/game');
  }, 3000);
}

function cancelPress() {
  navigator.vibrate([]);
  repogitIcon.classList.remove("shake");
  repogitIcon.style.animationDuration = `1s`; // volta ao normal
  clearTimeout(pressTimer);
  clearInterval(intervalTimer);
}
</script>

<template>
  <div class="vstack container align-items-center justify-content-between mt-5 mb-3">
    <div class="d-flex flex-column align-items-center user-select-none">
      <img id="repogit-icon"
       src="/bloctopus.svg" style="width: 7rem;" draggable="false" alt="Bloctopus icon">
      <h1 class="fw-semibold">Repogit</h1>
    </div>
    
    <div>
      <a class="btn btn-outline-primary hstack gap-2 justify-content-center" href="https://github.com/V0xa1tor/Bloctopus"><i class="bi bi-github"></i>Source code</a>
    </div>
    
    <div class="text-secondary">
      <p class="m-0">Version {{ useAppConfig().version }}</p>
    </div>
  </div>
</template>

<style scoped>
.shake {
  /* Start the shake animation and make the animation last for 0.5 seconds */
  animation: shake 1s;

  /* When the animation is finished, start again */
  animation-iteration-count: infinite;
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
</style>