import { defineStore } from "pinia";
import { ref } from "vue";
import LightningFS from "@isomorphic-git/lightning-fs";
import * as git from "isomorphic-git";
import JSZip from "jszip";
import type { FSDir } from "~/types/filesystem/FSDir";

export const useRepositoryStore = defineStore("repository", () => {

  const appConfig = useAppConfig();
  const filesystemStore = useFilesystemStore();
  
  const repositories = ref<FSDir[]>([]);

  /**
   * Creates a repository (directory with an ".git")
   * @param path Directory to create repository
   * @param name The name of repository
   */
  async function createRepository(name: string, path = "/") {
    const repositoryPath = `${path == "/" ? "" : path}/${name}`;
    await filesystemStore.filesystem.promises.mkdir(repositoryPath);
    await git.init({ fs: filesystemStore.filesystem, dir: repositoryPath });
  }

  /**
   * Lists all directories that has a ".git" folder (repositories)
   * @param path Directory to list repositories
   * @returns List of repositories
   */
  async function listRepositories(path = "/") {
    const dirs = (await filesystemStore.listFilesAndDirs(path)).filter(item => item.type == "dir");
    return dirs.filter(async dir => await filesystemStore.exists(`${dir.path}/.git`));
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
    listRepositories,
    createRepository,
    deleteRepository,
    renameRepository,
    exportRepositoryZip,
    importRepositoryZip
  };
});
