<script setup lang="ts">
import * as bootstrap from "bootstrap";

const repositoryStore = useRepositoryStore();

const treeData = ref<FSItem[]>([]);
watch(() => repositoryStore.repository, async (newRepo) => {
  if (newRepo) {
    treeData.value = await repositoryStore.listAllFilesAndDirs();
  } else {
    treeData.value = [];
  }
}, { immediate: true });

onMounted(async () => {
new BootstrapMenu('[data-path]', {
  fetchElementData: async (el) => {
    const path = el.dataset.path;
    const stat = await repositoryStore.repository?.pfs.stat(path!);
    return { path, stat, text: el.textContent };
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
      isEnabled: () => false,
      onClick: async (data) => alert(`Renomear: ${data.path}`)
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

});

function hideOffcanvas() {
  const bsOffcanvas = bootstrap.Offcanvas.getInstance("#offcanvas");
  if (bsOffcanvas) bsOffcanvas.hide();
}

async function createFile(path: string) {
  await repositoryStore.repository?.pfs.writeFile(`${path}/Arquivo.txt`, "", "utf8");
  await repositoryStore.loadRepositories();
}

async function createFolder(path: string) {
  await repositoryStore.repository?.pfs.mkdir(`${path}/Nova pasta`);
  await repositoryStore.loadRepositories();
}

</script>

<template>
  <div data-bs-backdrop="false" class="offcanvas offcanvas-start show" tabindex="-1" id="offcanvas">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasLabel">Blocos</h5>
      <!-- <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button> -->
    </div>
    <div data-path="/" class="offcanvas-body vstack gap-3">
      <div id="offcanvas-blocks" class="vstack gap-1">
        <FileTree :items="treeData" />
      </div>
    </div>
    <div class="p-3 hstack gap-2">
      <button
        class="btn btn-outline-primary hstack gap-2 p-1 w-100 justify-content-center"
        @click="createFolder('/')"
      >
        <i class="bi bi-folder"></i>Nova pasta
      </button>
      <button
        class="btn btn-outline-primary hstack gap-2 p-1 w-100 justify-content-center"
        @click="createFile('/')"
      >
        <i class="bi bi-file-earmark-text"></i>Novo arquivo
      </button>
    </div>
  </div>
</template>

<style scoped>
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