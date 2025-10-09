<script setup lang="ts">
import Sortable from 'sortablejs';

// Busca recursiva do item pela name e type
function findItemByName(items: FSItem[], name: string): FSItem | undefined {
  for (const item of items) {
    if (item.name === name && item.type === 'dir') return item;
    if (item.children) {
      const found = findItemByName(item.children, name);
      if (found) return found;
    }
  }
  return undefined;
}
// Flag para ignorar clique após drag
let ignoreClick = false;

const props = defineProps<{ items: FSItem[] }>();
const emit = defineEmits(['toggle-folder']);

function toggleFolder(item: FSItem) {
  // Garante reatividade usando Vue.set se necessário
  item.collapsed = !item.collapsed;
  // Não emite para cima, pois o estado é local e recursivo
  // Espera renderização e aplica sortable na pasta expandida correta
  if (item.type === 'dir' && !item.collapsed && item.children) {
    nextTick(() => setupSortable('tree'));
  }
}

function setupSortable(id: string) {
  setTimeout(() => {
    // Aplica SortableJS em todos os ul.list-unstyled
  const allUls = document.querySelectorAll('ul.list-unstyled');
    allUls.forEach((el) => {
      if (!el.classList.contains('sortable-initialized')) {
        Sortable.create(el as HTMLElement, {
          group: 'tree',
          animation: 150,
          fallbackOnBody: true,
          delay: 450,
          easing: "ease-out",
          delayOnTouchOnly: true,
          forceFallback: true,
          onStart(evt) {
            ignoreClick = true;
            // Fecha pasta ao iniciar drag
            const item = evt.item;
            // Encontra o item correspondente
            const itemName = item.querySelector('.fw-bold')?.textContent;
            if (itemName) {
              const item = findItemByName(props.items, itemName!);
              if (item && item.collapsed === false) item.collapsed = true;
            }
          },
          onEnd() {
            setTimeout(() => { ignoreClick = false; }, 100);
          }
        });
        el.classList.add('sortable-initialized');
      }
    });
  }, 0);
}
function applySortables() {
  // Não precisa mais de id, aplica SortableJS em todos os ul
  // Aplica sortable em todos os filhos
  nextTick(() => {
    const allUls = document.querySelectorAll('ul[class="tree"]');
    allUls.forEach((ul: Element) => {
      setupSortable(ul.id);
    });
  });
}

onMounted(() => {
  applySortables();
});

onUpdated(() => {
  applySortables();
});
</script>

<template>
  <ul class="list-unstyled gap-1 d-flex flex-column user-select-none m-0">
    <template v-for="item in items" :key="item.id">
      <li
        class="tree-item rounded gap-1 d-flex flex-column"
        :data-path="item.path"
      >
        <div
          class="file hstack gap-2 align-items-center rounded-2 py-1 px-2"
          @click="!ignoreClick
          ? (item.type === 'dir' ? toggleFolder(item) : navigateTo(item.path))
          : null"
        >
          <template v-if="item.type === 'dir'">
            <i class="text-body-tertiary" :class="item.collapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-down'" style="font-size:1.2em"></i>
            <span class="flex-grow-1 text-truncate">{{ item.name }}</span>
          </template>
          <template v-else>
            <i class="bi bi-file-earmark-text" style="font-size:1.2em"></i>
            <span class="flex-grow-1 text-truncate">{{ item.name }}</span>
          </template>
        </div>
        <ul v-if="item.type === 'dir' && !item.collapsed && item.children && item.children.length > 0" class="list-unstyled ms-3">
          <FileTree :items="item.children" @toggle-folder="toggleFolder" />
        </ul>
      </li>
    </template>
  </ul>
</template>

<style scoped>
/* Aplica hover apenas ao conteúdo do item, não ao li inteiro */
.file {
  cursor: pointer;
}
.file:hover {
  background-color: var(--bs-tertiary-bg) !important;
}

i, i::before {
  display: block;
}

.offcanvas {
  --bs-offcanvas-width: 300px;
  --bs-offcanvas-transition: margin 0.3s ease-in-out;
}

#offcanvas {
  position: relative;
  left: inherit;
  height: 100%;
  margin-left: calc(var(--bs-offcanvas-width) * -1);
}

.sortable-ghost {
  background-color: var(--bs-tertiary-bg);
}

.sortable-drag {
  opacity: 0 !important;
}

#offcanvas-blocks:not(:has(.sortable-ghost)) > div:hover {
  background-color: var(--bs-tertiary-bg);
}

#offcanvas-blocks:has(.sortable-ghost), #offcanvas-blocks:has(.sortable-ghost) * {
  cursor: grabbing;
}
</style>
