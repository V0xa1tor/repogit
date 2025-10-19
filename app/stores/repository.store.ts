import { defineStore } from "pinia";
import { ref } from "vue";
import LightningFS from "@isomorphic-git/lightning-fs";
import * as git from "isomorphic-git";
import { v4 as uuidv4 } from 'uuid';
import JSZip from "jszip";
import type FSInstance from "~/types/FSInstance";

export const useRepositoryStore = defineStore("repository", () => {

  const appConfig = useAppConfig();
  
  const repositories = ref<FSInstance[]>([]);

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
    // setRepository(name);

    await loadRepositories();
    return { name, fs, pfs: fs.promises } as FSInstance;
  }

  async function deleteRepository(name: string) {
    indexedDB.deleteDatabase(name);
    // if (repositoryName.value === name) setRepository(null);
    await loadRepositories();
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
    // setRepository(name);
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

  return {
    repositories,
    loadRepositories,
    createRepository,
    deleteRepository,
    renameRepository,
    exportRepositoryZip,
    importRepositoryZip
  };
});
