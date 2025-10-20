<script setup lang="ts">
import Sortable from 'sortablejs';
import appConfig from '~/app.config';

// Busca recursiva do item pela name e type
function findItemByName(item: FSItem, name: string): FSItem | undefined {
  for (const child of item.children!) {
    if (child.name === name && child.type === 'dir') return child;
    if (child.children) {
      const found = findItemByName(child, name);
      if (found) return found;
    }
  }
  return undefined;
}
// Flag para ignorar clique após drag
let ignoreClick = false;

const repositoryStore = useRepositoryStore();
const repoStore = useRepoStore();
const props = defineProps<{ item: FSItem }>();
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
              const item = findItemByName(props.item, itemName!);
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

function renameFocus(input: HTMLInputElement) {
  if (!input) return;
  input.oncontextmenu = (e) => e.stopPropagation();
  input.readOnly = false;
  input.focus();
  input.select();
}

async function renameFolder(item: FSItem, input: HTMLInputElement) {

  const path = item.path.split('/');
  path.pop();

  const newName = input.value.trim();

  if (!newName) {
    input.oncontextmenu = null;
    input.value = item.name;
    input.readOnly = true;
    return;
  }

  path.push(newName);
  const newPath = path.join('/');
  
  if (item.path === newPath) {
    input.oncontextmenu = null;
    input.value = item.name;
    input.readOnly = true;
    return;
  }

  if (await repoStore.exists(newPath)) {
    alert(`O arquivo "${newName}" já existe.`);
    input.oncontextmenu = null;
    input.value = item.name;
    input.readOnly = true;
    return;
  }

  try {
    await repoStore.repo?.pfs.rename(item.path, newPath);
    window.history.replaceState({}, '', newPath);
    await repositoryStore.loadRepositories();
  } catch(e) {
    alert(`Não foi possível renomear o arquivo "${item.path}" para "${newPath}". Verifique o console.`);
    console.error(e);
    input.value = item.name;
  }
  input.oncontextmenu = null;
  input.readOnly = true;
}
</script>

<template>
  <ul class="list-unstyled gap-1 d-flex flex-column user-select-none m-0">
    <template v-for="child in item.children">
      <li
        class="tree-item rounded gap-1 d-flex flex-column"
        :data-path="child.path"
      >
        <div
          class="file hstack align-items-center rounded-2 py-1 px-2"
        >
          <template v-if="child.type === 'dir'">
            <i
              class="text-body-tertiary"
              :class="child.collapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-down'"
              style="font-size:1.2em"
              @click="!ignoreClick ? toggleFolder(child) : null"
            ></i>
            <div
              class="input-wrapper w-100"
              @click="navigateTo(child.path)"
              @dblclick="(e) => renameFocus((e.target as HTMLLIElement).querySelector('input') as HTMLInputElement)"
            >
              <input readonly
                @keydown="(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }"
                @focusout="async (e) => await renameFolder(child, e.target as HTMLInputElement)"
                class="flex-grow-1 text-truncate form-control p-0 px-2 border-0 bg-transparent"
                :value="child.name"
              />
            </div>
          </template>
          <template v-else>
            <i
              class="bi"
              :class="{
                'bi-file-earmark-text': child.name == appConfig.pageFileName,
                'bi-database': child.name == appConfig.databaseFileName,
                'bi-gear': child.name == appConfig.settingsFileName,
                'bi-puzzle': child.name == appConfig.propertiesFileName,
                'bi-file-earmark': child.name
                  != appConfig.pageFileName
                  && appConfig.databaseFileName
                  && appConfig.settingsFileName
                  && appConfig.propertiesFileName
              }"
              style="font-size:1.2em"
              @click="!ignoreClick ? toggleFolder(child) : null"
            ></i>
            <div
              class="input-wrapper w-100"
              @click="navigateTo(child.path)"
              @dblclick="(e) => renameFocus((e.target as HTMLLIElement).querySelector('input') as HTMLInputElement)"
            >
              <input readonly
                @keydown="(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }"
                @focusout="async (e) => await renameFolder(child, e.target as HTMLInputElement)"
                class="flex-grow-1 text-truncate form-control p-0 px-2 border-0 bg-transparent"
                :value="child.name"
              />
            </div>
          </template>
        </div>
        <ul v-if="child.type === 'dir' && !child.collapsed && child.children && child.children.length > 0" class="list-unstyled ms-3">
          <FileTree :item="child" @toggle-folder="toggleFolder" />
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

.tree-item input[readonly] {
  pointer-events: none;
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
