<script setup lang="ts">
import { ref } from "vue";
import bootstrapIcons from "bootstrap-icons/font/bootstrap-icons.json";

// gera as cartas (duas de cada número) e embaralha
function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

const pairsNumber = 8;
const bi = Object.values(bootstrapIcons);
let icons: number[] = [];
for (let i = 0; i < pairsNumber; i++) {
  const randomIcon = bi[Math.floor(Math.random() * bi.length)]!;
  icons.push(randomIcon);
  icons.push(randomIcon);
}
icons = shuffle(icons);

// estado das cartas
const flipped = ref<boolean[]>(Array(icons.length).fill(false)); // true = virada
const matched = ref<boolean[]>(Array(icons.length).fill(false)); // true = já fez par

let firstPick: number | null = null;
let secondPick: number | null = null;
let lockBoard = false;

function handleFlip(index: number) {
  if (lockBoard || matched.value[index] || flipped.value[index]) return;

  flipped.value[index] = true;

  if (firstPick === null) {
    // primeira carta
    firstPick = index;
  } else if (secondPick === null) {
    // segunda carta
    secondPick = index;
    checkMatch();
  }
}

function checkMatch() {
  if (firstPick === null || secondPick === null) return;

  const isMatch = icons[firstPick] === icons[secondPick];

  if (isMatch) {
    matched.value[firstPick] = true;
    matched.value[secondPick] = true;
    resetTurn();
  } else {
    lockBoard = true;
    setTimeout(() => {
      flipped.value[firstPick!] = false;
      flipped.value[secondPick!] = false;
      resetTurn();
    }, 1000); // espera 1s e desvira
  }
}

function resetTurn() {
  firstPick = null;
  secondPick = null;
  lockBoard = false;
}
</script>

<template>
  <div class="p-3 w-100 h-100 user-select-none">
    <div
      class="d-grid m-auto"
      style="grid-template: repeat(4, 1fr) / repeat(4, 1fr); gap: 3%; aspect-ratio: 1 / 1; max-width: 100%; max-height: 100%;"
    >
      <div
        v-for="(icon, i) in icons"
        :key="i"
        class="flip-card rounded"
        @click="handleFlip(i)"
      >
        <div
          class="flip-card-inner"
          :style="{ transform: flipped[i] || matched[i] ? 'rotateY(180deg)' : 'rotateY(0deg)' }"
        >
          <div
            class="flip-card-front bg-body-tertiary rounded d-flex justify-content-center align-items-center"
          ></div>
          <div
            :class="{ 'bg-success': matched[i], 'bg-danger': lockBoard && !matched[i] }"
            class="flip-card-back bg-primary rounded d-flex justify-content-center align-items-center overflow-hidden"
          >
          
            <svg viewBox="0 0 100 100" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              <text x="50%" y="50%" 
                    fill="currentColor"
                    text-anchor="middle"
                    dominant-baseline="central"
                    alignment-baseline="middle"
                    font-size="60" 
                    font-family="bootstrap-icons">
                {{ String.fromCodePoint(icon) }}
              </text>
            </svg>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
i, i::before {
  display: block;
  font-size: 5dvw;
}

.rounded {
  border-radius: 10% !important;
}

.flip-card {
  perspective: 600px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.5s;
  transform-style: preserve-3d;
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-front {
  cursor: pointer;
}

.flip-card-back {
  transform: rotateY(180deg);
}

.flip-card-back svg {
  transform-box: fill-box;
  transform-origin: center;
  width: 100%; /* ou 100% */
  height: auto;
}
</style>
