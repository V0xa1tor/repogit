<script setup lang="ts">
import download from 'downloadjs';
import * as bootstrap from "bootstrap";
import { useRepositoryStore } from '~/stores/repository.store';

const repositoryStore = useRepositoryStore();
const repoStore = useRepoStore();

const newRepositoryName = ref('');
const isNewRepositoryNameValid = computed(() => newRepositoryName.value.trim().length > 0 && !repositoryStore.repositories?.some(repo => repo.name.trim() === newRepositoryName.value.trim()));
let newRepositoryModal: bootstrap.Modal;
const formWasValidated = ref(false);  

onMounted(async () => {
  const newRepositoryModalEl = document.getElementById('newRepositoryModal')!;
  const newRepositoryNameInput = document.getElementById('newRepositoryName')!;
  
  newRepositoryModal = new bootstrap.Modal(newRepositoryModalEl);

  newRepositoryModalEl.addEventListener('shown.bs.modal', () => {
    newRepositoryNameInput.focus();
  });

  newRepositoryModalEl.addEventListener('hidden.bs.modal', () => {
    formWasValidated.value = false;
  });
});

async function exportRepository(name: string) {
  const blob = await repositoryStore.exportRepositoryZip(name);
  download(blob!, name, "application/zip");
}

function importRepository(files: FileList | null) {
  if (!files || !files.length) return;
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    if (file.name.endsWith('.zip')) {
      repositoryStore.importRepositoryZip(file.name.slice(0, file.name.length - 4), file);
    } else {
      alert(`O arquivo "${file.name}" não é um arquivo .zip válido.`);
    }
  }
}

async function createNewRepository(name: string) {
  formWasValidated.value = true;
  if (!isNewRepositoryNameValid.value) return;

  repositoryStore.createRepository(name.trim());
  newRepositoryName.value = '';
  formWasValidated.value = false;
  newRepositoryModal.hide();
}

function deleteRepository(name: string) {
  if (!confirm(`Tem certeza que deseja excluir o repositório "${name}"?`)) return;
  repositoryStore.deleteRepository(name);
}

</script>

<template>
  <div class="container vstack py-3 gap-3">

    <h1 class="mb-3">Repositórios</h1>

    <div class="vstack gap-3 mb-3">

      <!-- No repository -->
      <div v-if="!repositoryStore.repositories.length" class="card text-body-tertiary" style="border-style: dashed;">
        <div class="card-body text-center">
          <h2 class="m-0">Sem repositório</h2>
          <small>Crie ou importe um repositório</small>
        </div>
      </div>

      <!-- Repository list -->
      <div v-for="repo in repositoryStore.repositories" :key="repo.name">
        <label class="card" :for="repo.name">
          <div class="card-body hstack">
  
            <input
              type="radio"
              class="form-check-input m-0 me-3"
              name="repository"
              :id="repo.name"
              autocomplete="off"
              @change="repoStore.setRepository(repo.name)"
              :checked="repoStore.repo?.name === repo.name"
            />

            <div class="me-auto">
              <h2 class="m-0">{{ repo.name }}</h2>
            </div>
            
            <div class="dropdown align-self-start">
              <button class="btn p-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-three-dots"></i>
              </button>
              <ul class="dropdown-menu">
                <li><button class="dropdown-item" @click="repositoryStore.renameRepository(repo.name, 'renamed')">Renomear</button></li>
                <li><button class="dropdown-item" @click="exportRepository(repo.name)">Exportar</button></li>
                <li><hr class="dropdown-divider"></li>
                <li><button class="dropdown-item text-danger" @click="deleteRepository(repo.name)">Excluir</button></li>
              </ul>
            </div>
            
          </div>
        </label>
      </div>

      <div class="hstack gap-3 justify-content-end flex-wrap">
        <button class="btn btn-outline-primary hstack gap-2" data-bs-toggle="modal" data-bs-target="#newRepositoryModal"><i class="bi bi-plus-lg"></i>Novo repositório</button>
        <label class="btn btn-outline-primary hstack gap-2" for="import"><i class="bi bi-download"></i>Importar repositório</label>
        <input class="d-none" @change="(e) => importRepository((e.target as HTMLInputElement).files)" type="file" multiple id="import">
      </div>
      
    </div>


    <!-- Modal -->
    <div class="modal fade" id="newRepositoryModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Criar novo repositório</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="vstack gap-3">
              <form id="newRepositoryModalForm" @submit.prevent="createNewRepository(newRepositoryName)">
                <div class="form-floating">
                  <input :class="{'is-valid': formWasValidated && isNewRepositoryNameValid, 'is-invalid': formWasValidated && !isNewRepositoryNameValid}" v-model="newRepositoryName" type="text" class="form-control" id="newRepositoryName" placeholder="Novo repositório" autocomplete="off" />
                  <label for="newRepositoryName">Nome do repositório</label>
                  <div class="invalid-feedback">
                    {{ repositoryStore.repositories?.some(repo => repo.name.trim() === newRepositoryName.trim()) ? 'Já existe um repositório com esse nome' : 'O nome não pode ser vazio' }}
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="modal-footer justify-content-between">
            <small class="text-secondary text-end">Versão {{ useAppConfig().version }}</small>
            <div class="flex-grow-1 text-end">
              <button type="button" class="btn" data-bs-dismiss="modal">Cancelar</button>
              <input type="submit" form="newRepositoryModalForm" class="btn btn-primary" value="Criar repositório" />
            </div>
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

label.card, label.card input {
  cursor: pointer;
  .dropdown {
    cursor: auto;
  }
}

label.card:has(input:checked) {
  border-color: var(--bs-primary);
  background-color: rgba(var(--bs-primary-rgb), .05);
  box-shadow: 0 0 0 2px rgba(var(--bs-primary-rgb), 1);
}
</style>