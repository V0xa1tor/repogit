<script setup lang="ts">
import type { FSDir } from "~/types/filesystem/FSDir";

const repositoryStore = useRepositoryStore();
const repoStore = useRepoStore();
const breakpoint = useBreakpointStore();
const actionMenuHeight = ref(0);
const topBarHeight = ref(0);

const filesystemStore = useFilesystemStore();

const root = ref<FSDir>({
  name: "root",
  path: "/",
  type: "dir"
});
watch(() => filesystemStore.filesystem, async (fs) => {
  if (fs) {
    const items = await filesystemStore.listFilesAndDirs("/", true);
    root.value!.children = items;
  } else {
    root.value!.children = undefined;
  }
}, { immediate: true });

onMounted(async () => {
  new BootstrapMenu('[data-path]', {
    fetchElementData: async (el) => {
      const path = el.dataset.path;
      const input = el.querySelector("input")!;
      const stat = await filesystemStore.filesystem.promises.stat(path!);
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
        // isShown: async (data) => data.stat?.isDirectory(),
        isShown: () => false,
        onClick: async (data) => await createFolder(data.path!)
      },
      createRepository: {
        name: 'Criar repositório',
        iconClass: 'archive',
        isShown: async (data) => data.stat?.isDirectory(),
        onClick: async (data) => await repositoryStore.createRepository("Teste")
      },
      createFile: {
        name: 'Criar página',
        iconClass: 'file-earmark-text',
        isShown: async (data) => data.stat?.isDirectory(),
        onClick: async (data) => await createFile(data.path!)
      },
      createDatabase: {
        name: 'Criar banco de dados',
        iconClass: 'database',
        isShown: async (data) => data.stat?.isDirectory(),
        isEnabled: () => false,
        onClick: () => {}
      },
      rename: {
        name: 'Renomear',
        iconClass: 'pencil',
        isShown: async (data) => data.path !== '/',
        onClick: async (data) => renameFocus(data.input)
      },
      delete: {
        name: 'Excluir',
        iconClass: 'trash',
        isShown: async (data) => data.path !== '/',
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
  await repoStore.repo?.pfs.mkdir(`${path}/Nova pasta`);
  await repositoryStore.loadRepositories();
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
  <div class="offcanvas-header pb-0">
    <select @change="navigateTo(($event.target as HTMLOptionElement).value)" class="form-select">
      <option :value="root.path">{{root.name}}</option>
      <hr />
      <optgroup label="Repositórios:">
        <option v-for="repo in repositoryStore.repositories" :value="repo.path">{{repo.name}}</option>
      </optgroup>
    </select>
  </div>
    <div data-path="/" class="offcanvas-body vstack gap-3">
      <div v-if="root.children?.length" id="offcanvas-blocks" class="vstack gap-1">
        <FileTree :item="root" />
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