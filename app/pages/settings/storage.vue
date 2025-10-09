<script setup lang="ts">
import { Chart, type ChartConfiguration } from 'chart.js/auto';

const estimate = ref<StorageEstimate>();
const chartInstance = ref<Chart | null>(null);

const freeSpace = computed(() => {
  if (estimate.value?.quota && estimate.value?.usage) {
    return estimate.value.quota - estimate.value.usage;
  }
  return 0;
});

const dbSpace = computed(() => estimate.value?.usage ?? 0);

const percentUsed = computed(() => {
  if (estimate.value?.quota && estimate.value?.usage) {
    return (estimate.value.usage / estimate.value.quota) * 100;
  }
  return 0;
});

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

onMounted(async () => {
  const ctx = document.getElementById('storage-chart') as HTMLCanvasElement;

  if (navigator.storage) {
    estimate.value = await navigator.storage.estimate();

    const data = {
      labels: [
        `Livre (${formatBytes(freeSpace.value)})`,
        `Usado (${formatBytes(dbSpace.value)})`
      ],
      datasets: [{
        data: [freeSpace.value, dbSpace.value],
        backgroundColor: [
          'rgb(255, 205, 86)',
          'rgb(54, 162, 235)'
        ],
        hoverOffset: 4
      }]
    };
    
    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false, // evita scroll
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const value = ctx.parsed;
                const percent = ((value / (estimate.value?.quota ?? 1)) * 100).toFixed(1);
                return `${ctx.label}: ${formatBytes(value)} (${percent}%)`;
              }
            }
          }
        }
      }
    };
    
    chartInstance.value = new Chart(ctx, config);
  }
});
</script>

<template>
  <div class="container my-5 text-center">
    <h1 class="mb-4">Armazenamento</h1>

    <div class="d-flex justify-content-center">
      <div class="position-relative chart-wrapper">
        <canvas v-show="estimate" id="storage-chart"></canvas>

        <div
          v-if="estimate"
          class="position-absolute top-50 start-50 translate-middle text-center"
          style="pointer-events:none;"
        >
          <h4 class="fw-bold mb-0">{{ percentUsed.toFixed(1) }}%</h4>
          <small class="text-muted">usado</small>
        </div>

        <div v-if="!estimate" class="text-danger mt-3">
          <h5>Estimativa não suportada</h5>
          <ul class="text-start d-inline-block">
            <li>Você está em um contexto não seguro (HTTP)</li>
            <li>Seu navegador não suporta o Storage</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-wrapper {
  width: 260px;
  height: 260px;
  max-width: 90vw;
  position: relative;
}
canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
