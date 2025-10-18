import { defineStore } from "pinia";
import { ref } from "vue";
import LightningFS from "@isomorphic-git/lightning-fs";
import * as git from "isomorphic-git";
import { v4 as uuidv4 } from 'uuid';
import JSZip from "jszip";

export interface FsInstance {
  name: string;
  fs: LightningFS;
  pfs: LightningFS.PromisifiedFS;
}

export const useRepositoryStore = defineStore("repository", () => {

  const appConfig = useAppConfig();
  
  const repositories = ref<FsInstance[]>([]);
  const repository = computed(() => {
    if (!repositoryName.value) return null;
    const found = repositories.value.find(repo => repo.name === repositoryName.value);
    return found ? found : null;
  });

  const repositoryName = ref(localStorage.getItem(appConfig.localStorageRepositoryKey));
  watch(repositoryName, (newName) => {
    if (newName) {
      localStorage.setItem(appConfig.localStorageRepositoryKey, newName);
    } else {
      localStorage.removeItem(appConfig.localStorageRepositoryKey);
    }
  });

  async function loadRepositories() {
    // API moderna: navigator.storage.databases()
    if ("databases" in indexedDB) {
      // @ts-ignore - algumas libs ainda não tiparam
      const dbs = await indexedDB.databases();
      repositories.value = dbs.map(db => {
        const fs = new LightningFS(db.name!);
        return { name: db.name!, fs, pfs: fs.promises };
      });
    } else {
      // fallback se databases não existir
      console.warn("indexedDB.databases() não suportado neste navegador.");
    }
  }

  async function createRepository(name: string) {
    const fs = new LightningFS(name);

    // Inicializa um repo Git
    await git.init({ fs, dir: "/" });
    setRepository(name);

    await loadRepositories();
    return { name, fs, pfs: fs.promises } as FsInstance;
  }

  function setRepository(name: string | null) {
    repositoryName.value = name;
  }

  async function deleteRepository(name: string) {
    indexedDB.deleteDatabase(name);
    if (repositoryName.value === name) setRepository(null);
    await loadRepositories();
  }

  async function createPage(path: string, name: string) {
    const dirPath = `${path}/${name + appConfig.uuidSeparator + uuidv4()}`;
    await repository.value?.pfs.mkdir(dirPath);
    await repository.value?.pfs.writeFile(`${dirPath}/${appConfig.pageFileName}`, '', 'utf8');
  }

  /** Exporta o FS inteiro como um Blob ZIP */
  async function exportRepositoryZip(name: string): Promise<Blob | null> {
    const instance = repositories.value.find(f => f.name === name);
    if (!instance) return null;

    const zip = new JSZip();

    const walk = async (path = "/") => {
      const entries = await instance.pfs.readdir(path);
      for (const entry of entries) {
        console.log({ path, entry });
        const fullPath = path === "/" ? `/${entry}` : `${path}/${entry}`;
        const stat = await instance.pfs.stat(fullPath);
        if (stat.type === "dir") {
          await walk(fullPath);
        } else {
          const content = await instance.pfs.readFile(fullPath, "utf8");
          // Remove a "/" inicial para que o zip não crie uma pasta vazia
          zip.file(fullPath.slice(1), content);
        }
      }
    };

    await walk("/");

    return await zip.generateAsync({ type: "blob" });
  }

  /** Importa um ZIP para dentro do FS */
  async function importRepositoryZip(name: string, zipBlob: Blob) {
    const fs = new LightningFS(name);

    const zip = await JSZip.loadAsync(zipBlob);

    for (const [path, entry] of Object.entries(zip.files)) {
      if (entry.dir) {
        try {
          await fs.promises.mkdir("/" + path);
        } catch {}
      } else {
        const content = await (entry as JSZip.JSZipObject).async("string");
        // garante diretório antes de criar o arquivo
        const dirs = path.split("/").slice(0, -1);
        let acc = "";
        for (const d of dirs) {
          acc += "/" + d;
          try {
            await fs.promises.mkdir(acc);
          } catch {}
        }
        await fs.promises.writeFile("/" + path, content, "utf8");
      }
    }
    setRepository(name);
    await loadRepositories();
  }

  async function renameRepository(oldName: string, newName: string) {
    const zip = await exportRepositoryZip(oldName);
    deleteRepository(oldName);
    createRepository(newName);
    if (zip) {
      await importRepositoryZip(newName, zip);
    }
    await loadRepositories();
  }

  async function exists(path: string) {
    try {
      await repository.value?.pfs.stat(path);
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
    if (!repository.value) return items;
    try {
      const entries = await repository.value?.pfs.readdir(dir);

      for (const entry of entries) {
        const fullPath = `${dir === '/' ? '' : dir}/${entry}`;
        const stat = await repository.value?.pfs.stat(fullPath);

        if (stat.type === 'dir') {
          // Diretório: busca recursivamente
          const children = await listAllFilesAndDirs(fullPath);
          items.push({
            name: entry,
            path: fullPath,
            type: 'dir',
            children,
            collapsed: true
          });
        } else {
          // Arquivo
          items.push({
            name: entry,
            path: fullPath,
            type: 'file'
          });
        }
      }
    } catch (err) {
      console.error(`Erro ao ler ${dir}:`, err);
    }

    return items;
  }

  async function getFile(path: string): Promise<FSFile | null> {
    if (!repository.value) return null;
    return {
      name: path.replace(/\/$/, "").split("/").pop()!,
      path,
      content: await repository.value?.pfs.readFile(path, "utf8")
    };
  }

  async function removeRecursively(path: string) {
  try {
    // Tenta ler a pasta
    const files = await repository.value?.pfs.readdir(path)!;

    // Se conseguir ler, é uma pasta: percorre os arquivos/subpastas
    for (const file of files) {
      await removeRecursively(`${path}/${file}`);
    }

    // Após esvaziar, remove a pasta
    await repository.value?.pfs.rmdir(path);
  } catch (err: any) {
    if (err.code === 'ENOTDIR') {
      // Não é uma pasta, então é arquivo: remove com unlink
      await repository.value?.pfs.unlink(path);
    } else if (err.code === 'ENOENT') {
      // Arquivo/pasta não existe, ignora
      return;
    } else {
      throw err; // outros erros
    }
  }
  await loadRepositories();
}


  return {
    repositories,
    repository,
    loadRepositories,
    createRepository,
    setRepository,
    deleteRepository,
    renameRepository,
    exportRepositoryZip,
    importRepositoryZip,
    listAllFilesAndDirs,
    createPage,
    exists,
    getFile,
    removeRecursively
  };
});
