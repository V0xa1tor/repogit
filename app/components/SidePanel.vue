<script setup lang="ts">
import type { FSDir } from '~/types/filesystem/FSDir';
import type { FSItem } from '~/types/filesystem/FSItem';

const router = useRouter();
const path = ref(decodeURIComponent(router.currentRoute.value.path));
const repositoryStore = useRepositoryStore();
const repoStore = useRepoStore();
const breakpoint = useBreakpointStore();
const actionMenuHeight = ref(0);
const topBarHeight = ref(0);

const filesystemStore = useFilesystemStore();

watch(() => router.currentRoute.value.path, async (newPath) => {
  path.value = decodeURIComponent(newPath);
  
  let item = await filesystemStore.getItem(path.value);

  if (!item?.isRepo) {
    item = await filesystemStore.getItem("/");
    item!.children = await filesystemStore.list("/", true);
    filesystemStore.root = item;
    return;
  }

  item!.children = await filesystemStore.list(path.value, true);
  filesystemStore.root = item;
}, { immediate: true });
// const groups = computed(() => {
//   if (filesystemStore.root) {
//     const dirs = filesystemStore.root.children?.filter((child): child is FSDir => child.type == "dir" && child.children!.length > 0);
//     return dirs;
//   } else {
//     return undefined;
//   }
// });

// watch(() => filesystemStore.root, async (root) => {
//   const items = await filesystemStore.list("/", true);
//   root!.dir.children = items;
// }, { immediate: true });

onMounted(async () => {
  new BootstrapMenu('[data-path]', {
    fetchElementData: async (el) => {
      const path = el.dataset.path;
      const item = await filesystemStore.getItem(path!);
      const input = el.querySelector("input")!;
      const stat = await filesystemStore.filesystem.promises.stat(path!);
      return { path, item, stat, input, text: el.textContent };
    },
    actionsGroups: [
      ['createRepository', "createDocs"],
      ['createFolder', "createFile", "createDatabase"],
      ['rename', 'delete']
    ],
    menuEvent: 'right-click',
    actions: {
      createRepository: {
        name: 'Criar repositório',
        iconClass: 'archive',
        isShown: async (data) => path.value == "/",
        onClick: async (data) => await repositoryStore.createRepository("Repo", data.path)
      },
      createDocs: {
        name: 'Criar docs',
        iconClass: 'book',
        isShown: async (data) => path.value == "/",
        onClick: async (data) => await repositoryStore.createDocs()
      },
      createFolder: {
        name: 'Criar pasta',
        iconClass: 'folder',
        isShown: async (data) => path.value == "/" && data.item?.type == "item",
        onClick: async (data) => await createFolder(data.path!)
      },
      createFile: {
        name: 'Criar página',
        iconClass: 'file-earmark-text',
        isShown: async (data) => data.item?.properties.id != "root" && data.stat?.isDirectory(),
        onClick: async (data) => await createFile(data.path!)
      },
      createDatabase: {
        name: 'Criar banco de dados',
        iconClass: 'database',
        isShown: async (data) => data.item?.properties.id != "root" && data.stat?.isDirectory(),
        isEnabled: () => false,
        onClick: () => {}
      },
      rename: {
        name: 'Renomear',
        iconClass: 'pencil',
        isShown: async (data) => data.item?.properties.id != "root",
        onClick: async (data) => renameFocus(data.input)
      },
      delete: {
        name: 'Excluir',
        iconClass: 'trash',
        isShown: async (data) => data.item?.properties.id != "root",
        onClick: async (data) => {
          if (data.path && !confirm(`Excluir "${data.path}"?`)) return;
          // await repoStore.removeRecursively(data.path);
        }
      }
    }
  });

  function renameFocus(input: HTMLInputElement) {
    input.oncontextmenu = (e) => e.stopPropagation();
    input.readOnly = false;
    input.focus();
  }

  const actionMenu = document.getElementById("action-menu")!;
  const actionMenuObserver = new ResizeObserver(() => {
    actionMenuHeight.value = actionMenu.offsetHeight;
  });
  actionMenuObserver.observe(actionMenu);

  const topBar = document.getElementById("top-bar")!;
  const topBarObserver = new ResizeObserver(() => {
    topBarHeight.value = topBar.offsetHeight;
  });
  topBarObserver.observe(actionMenu);

});

async function createFile(path: string) {
  // await repositoryStore.repository?.pfs.writeFile(`${path}/Arquivo.txt`, "", "utf8");
  await repoStore.createPage(path, 'Sem título');
  await repositoryStore.loadRepositories();
}

async function createFolder(path: string) {
  await filesystemStore.createFolder(path, "Pasta");
}

</script>

<template>
  <div id="offcanvas"
    @contextmenu="(e) => e.preventDefault()"
    class="offcanvas show offcanvas-start border-end"
    :class="{'position-relative': breakpoint.isMdUp, 'h-100': breakpoint.isMdUp}"
    :style="`top: ${breakpoint.isMdUp ? 0 : topBarHeight}px; bottom: ${breakpoint.isMdUp ? 0 : actionMenuHeight}px;`"
    tabindex="-1"
  >
  <div class="offcanvas-header">
    <select :value="path" @change="navigateTo(($event.target as HTMLOptionElement).value)" class="form-select">
      <option value="/">Raiz</option>
      <optgroup v-for="group in filesystemStore.repos?.filter(repo => !repo.isRepo && repo.children?.length != 0)" :label="group.name">
        <option v-for="repo in group.children" :value="repo.path">{{ repo.name }}</option>
      </optgroup>
      <option v-for="repo in filesystemStore.repos?.filter(repo => repo.isRepo)" :value="repo.path">{{ repo.name }}</option>
    </select>
  </div>
  <div data-path="/" class="offcanvas-body pt-0 vstack gap-3">
      <!-- {{ filesystemStore.root }} -->
      <div v-if="filesystemStore.root?.children?.length" id="offcanvas-blocks" class="vstack gap-1">
        <FileTree :item="filesystemStore.root" />
      </div>
      <div v-else>
        <div class="text-center fs-5 text-body-tertiary">
          <div v-if="repoStore.repo">
            O repositório "{{ repoStore.repo?.name }}" está vazio.
          </div>
          <div v-else>
            Nenhum repositório selecionado.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
i, i::before {
  display: block;
}

.offcanvas {
  margin-left: calc(var(--bs-offcanvas-width) * -1);
  --bs-offcanvas-transition: margin 0.3s ease-in-out;
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