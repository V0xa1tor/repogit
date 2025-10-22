import { defineStore } from "pinia";
import { ref } from "vue";
import LightningFS from "@isomorphic-git/lightning-fs";
import * as git from "isomorphic-git";
import { v4 as uuidv4 } from 'uuid';
import JSZip from "jszip";
import type FSInstance from "~/types/FSInstance";

export const useRepoStore = defineStore("repo", () => {

  const appConfig = useAppConfig();
  const repositoryStore = useRepositoryStore();
  
  const repo = computed(() => {
    if (!repoName.value) return null;
    const found = repositoryStore.repositories.find((r: FSInstance) => r.name === repoName.value);
    return found ? found : null;
  });

  const repoName = ref(localStorage.getItem(appConfig.localStorageRepositoryKey));
  watch(repoName, (newName) => {
    if (newName) {
      localStorage.setItem(appConfig.localStorageRepositoryKey, newName);
    } else {
      localStorage.removeItem(appConfig.localStorageRepositoryKey);
    }
  });

  function setRepository(name: string | null) {
    repoName.value = name;
  }

  async function createPage(path: string, name: string) {
    let dirPath = `${path}/${name}`;
    let num = 0;
    while (await exists(`${dirPath}${num ? ' ' + num : ''}`)) ++num;
    if (num) dirPath += " " + num;
    await repo.value?.pfs.mkdir(dirPath);
    await repo.value?.pfs.writeFile(`${dirPath}/${appConfig.pageFileName}`, '', 'utf8');

    const properties: properties = {
      id: uuidv4(),
      order: 1,
      collapsed: true
    };
    await repo.value?.pfs.writeFile(`${dirPath}/${appConfig.propertiesFileName}`, JSON.stringify(properties, null, '\t'), 'utf8');
  }

  async function exists(path: string) {
    try {
      await repo.value?.pfs.stat(path);
      return true; // existe
    } catch (err) {
      if (err instanceof Error && (err as any).code === "ENOENT") return false; // não existe
      throw err; // outro erro inesperado
    }
  }

  /**
   * Função recursiva que lista todos os arquivos e diretórios.
   * @param dir Caminho inicial (por padrão, a raiz '/')
   * @returns Lista de arquivos e diretórios a partir de `dir`
   */
  async function listAllFilesAndDirs(dir = '/'): Promise<FSItem[]> {
    const items: FSItem[] = [];
    if (!repo.value) return items;
    try {
      const entries = await repo.value?.pfs.readdir(dir);

      for (const entry of entries) {
        const fullPath = `${dir === '/' ? '' : dir}/${entry}`;
        const stat = await repo.value?.pfs.stat(fullPath);

        if (stat.type === 'dir') {
          // Diretório: busca recursivamente
          const children = await listAllFilesAndDirs(fullPath);
          items.push({
            id: '',
            name: entry,
            path: fullPath,
            // type: 'dir',
            children,
            collapsed: true
          });
        } else {
          // Arquivo
          items.push({
            id: '',
            name: entry,
            path: fullPath,
            // type: 'file'
          });
        }
      }
    } catch (err) {
      console.error(`Erro ao ler ${dir}:`, err);
    }

    return items;
  }

  async function listItems(dir = '/'): Promise<FSItem[]> {
    const items: FSItem[] = [];
    if (!repo.value) return items;
    try {
      const entries = await repo.value?.pfs.readdir(dir);

      for (const entry of entries) {
        const fullPath = `${dir === '/' ? '' : dir}/${entry}`;
        const stat = await repo.value?.pfs.stat(fullPath);

        if (stat.type === 'dir' && entry !== ".git") {
          
          // Tipo do item
          const type = await getItemType(fullPath);
          
          const properties = await getProperties(fullPath);
          
          // Diretório: busca recursivamente
          const children = await listItems(fullPath);
          items.push({
            id: properties.id,
            name: entry,
            path: fullPath,
            type,
            children,
            collapsed: properties.collapsed
          });
        }
      }
    } catch (err) {
      console.error(`Erro ao ler ${dir}:`, err);
    }

    return items;
  }

  async function getProperties(path: string) {
    const propertiesPath = `${path}/${appConfig.propertiesFileName}`;
    // const hasProperties = await exists(propertiesPath);
    const properties = await getFile(propertiesPath);
    return JSON.parse(properties?.content!) as properties;
  }

  async function setProperties(path: string, properties: properties) {
    const propertiesPath = `${path}/${appConfig.propertiesFileName}`;
    repo.value?.pfs.writeFile(propertiesPath, JSON.stringify(properties, null, "\t"), 'utf8');
  }

  async function getItemType(path: string) {
    return await exists(`${path}/${appConfig.pageFileName}`)
      ? 'page'
      : await exists(`${path}/${appConfig.databaseFileName}`)
      ? 'database'
      : undefined;
  }

  async function getFile(path: string): Promise<FSFile | null> {
    if (!repo.value) return null;
    return {
      name: path.replace(/\/$/, "").split("/").pop()!,
      path,
      content: await repo.value?.pfs.readFile(path, "utf8")
    };
  }

  async function removeRecursively(path: string) {
    try {
      // Tenta ler a pasta
      const files = await repo.value?.pfs.readdir(path)!;

      // Se conseguir ler, é uma pasta: percorre os arquivos/subpastas
      for (const file of files) {
        await removeRecursively(`${path}/${file}`);
      }

      // Após esvaziar, remove a pasta
      await repo.value?.pfs.rmdir(path);
    } catch (err: any) {
      if (err.code === 'ENOTDIR') {
        // Não é uma pasta, então é arquivo: remove com unlink
        await repo.value?.pfs.unlink(path);
      } else if (err.code === 'ENOENT') {
        // Arquivo/pasta não existe, ignora
        return;
      } else {
        throw err; // outros erros
      }
    }
    // await loadRepositories();
  }

  return {
    repo,
    setRepository,
    listAllFilesAndDirs,
    listItems,
    createPage,
    getProperties,
    setProperties,
    getItemType,
    exists,
    getFile,
    removeRecursively
  };
});
