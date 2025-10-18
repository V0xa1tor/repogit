<script setup lang="ts">
import * as bootstrap from "bootstrap";

const repositoryStore = useRepositoryStore();
const breakpoint = useBreakpointStore();
const actionMenuHeight = ref(0);
const topBarHeight = ref(0);

const treeData = ref<FSItem>({
  name: "root",
  path: "/",
  type: "dir"
});
watch(() => repositoryStore.repository, async (newRepo) => {
  if (newRepo) {
    treeData.value!.children = await repositoryStore.listAllFilesAndDirs();
  } else {
    treeData.value!.children = [];
  }
}, { immediate: true });

onMounted(async () => {
  new BootstrapMenu('[data-path]', {
    fetchElementData: async (el) => {
      const path = el.dataset.path;
      const input = el.querySelector("input")!;
      const stat = await repositoryStore.repository?.pfs.stat(path!);
      return { path, stat, input, text: el.textContent };
    },
    actionsGroups: [
      ['rename', 'delete']
    ],
    menuEvent: 'right-click',
    actions: {
      createFolder: {
        name: 'Criar pasta',
        iconClass: 'folder',
        isShown: async (data) => data.stat?.isDirectory(),
        onClick: async (data) => createFolder(data.path!)
      },
      createFile: {
        name: 'Criar arquivo',
        iconClass: 'file-earmark-text',
        isShown: async (data) => data.stat?.isDirectory(),
        onClick: async (data) => createFile(data.path!)
      },
      rename: {
        name: 'Renomear',
        iconClass: 'type',
        isShown: async (data) => data.path !== '/',
        onClick: async (data) => renameFocus(data.input)
      },
      delete: {
        name: 'Excluir',
        iconClass: 'trash',
        isShown: async (data) => data.path !== '/',
        onClick: async (data) => {
          if (data.path && !confirm(`Excluir "${data.path}"?`)) return;
          await repositoryStore.removeRecursively(data.path);
        }
      }
    }
  });

  function renameFocus(input: HTMLInputElement) {
    input.disabled = false;
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
  await repositoryStore.createPage(path, 'teste');
  await repositoryStore.loadRepositories();
}

async function createFolder(path: string) {
  await repositoryStore.repository?.pfs.mkdir(`${path}/Nova pasta`);
  await repositoryStore.loadRepositories();
}

async function rename(path: string) {

}

</script>

<template>
  <div id="offcanvas"
    class="offcanvas show offcanvas-start border-end"
    :class="{'position-relative': breakpoint.isMdUp, 'h-100': breakpoint.isMdUp}"
    :style="`top: ${breakpoint.isMdUp ? 0 : topBarHeight}px; bottom: ${breakpoint.isMdUp ? 0 : actionMenuHeight}px;`"
    tabindex="-1"
  >
    <div data-path="/" class="offcanvas-body vstack gap-3">
      <div id="offcanvas-blocks" class="vstack gap-1">
        <FileTree :item="treeData" />
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