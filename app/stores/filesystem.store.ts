import LightningFS from "@isomorphic-git/lightning-fs";
import type { FSFile } from "~/types/filesystem/FSFile";
import type { FSDir } from "~/types/filesystem/FSDir";
import type { FSItem } from "~/types/filesystem/FSItem";
import type { properties } from "~/types/repo/properties";
import type { settings } from "~/types/repo/settings";
import { v4 as uuidV4 } from "uuid";

export const useFilesystemStore = defineStore("filesystem", () => {

  const appConfig = useAppConfig();
  const propertiesStore = usePropertiesStore();

  const filesystem = new LightningFS(appConfig.fsName);
  const repos = ref<FSItem[] | null>(null);
  const root = ref<FSItem | null>(null);

  /**
   * Checks if a file or dir exists.
   * @param path file or dir to check if exists.
   * @returns true if exists, false if not.
   */
  async function exists(path: string) {
    try {
      await filesystem.promises.stat(path);
      return true; // exists
    } catch (err) {
      if (err instanceof Error && (err as any).code === "ENOENT") return false; // not exists
      throw err;
    }
  }

  /**
   * Get an item giving a path
   * @param path path to file/dir
   * @returns an item wich is a dir with properties
   */
  async function getItem(path: string): Promise<FSItem | null> {
    try {
      const stat = await filesystem.promises.stat(path);
      const splittedPath = path.split("/");
      const name = splittedPath.pop()!;

      if (stat.isDirectory()) {
        const properties: properties = JSON.parse(await filesystem.promises.readFile(`${path}/${appConfig.propertiesFileName}`, "utf8"));
        const settingsPath = `${path}/${appConfig.settingsFileName}`;
        const settings: settings | undefined = await exists(settingsPath)
        ? JSON.parse(await filesystem.promises.readFile(settingsPath, "utf8"))
        : undefined;
        const isRepo = await exists(`${path}/.git`);

        return {
          type: "item",
          name: name,
          path,
          isRepo,
          properties,
          settings
        };

      } else {
        if ([
          appConfig.propertiesFileName,
          appConfig.settingsFileName,
          appConfig.pageFileName,
          appConfig.databaseFileName
        ].includes(name)) {
          
          const parentPath = splittedPath.length == 1 ? "/" : splittedPath.join("/");
          const parentName = parentPath == "/" ? "root" : parentPath.split("/").pop()!;

          const dir: FSDir = { type: "dir", name: parentName, path: parentPath };
          const properties: properties = parentPath == "/"
          ? { id: "root", type: "folder", order: 0, collapsed: false } // root properties.json
          : JSON.parse(await filesystem.promises.readFile(`${parentPath}/${appConfig.propertiesFileName}`, "utf8"))
          const settingsPath = `${parentPath}/${appConfig.settingsFileName}`;
          const settings: settings | undefined = await exists(settingsPath)
          ? JSON.parse(await filesystem.promises.readFile(settingsPath, "utf8"))
          : undefined;

          return {
            type: "item",
            name: parentName,
            path: parentPath,
            properties,
            settings
          };

        } else {
          throw new Error("Not default file.");
        }
      }

    } catch (err) {
      console.error(`Error getting item ${path}:`, err);
    }
    return null;
  }

  /**
   * List all files and directories in a directory.
   * @param dir Directory to list. Defaults to "/".
   * @param recursive If list subdirectories. Defaults to false.
   * @returns Array of file/dir.
   */
  async function list(dir = "/", recursive = false): Promise<(FSFile | FSItem)[]> {
    const items: (FSFile | FSItem)[] = [];
    try {
      const entries = await filesystem.promises.readdir(dir);
      
      for (const entry of entries) {
        console.log(entry);
        const fullPath = `${dir == "/" ? "" : dir}/${entry}`;
        const stat = await filesystem.promises.stat(fullPath);

        if (stat.type == "dir") {
          const isRepo = await exists(`${fullPath}/.git`);
          const children = recursive && (entry != ".git") ? await list(fullPath, true) : undefined;
          const properties = (entry != ".git") ? await propertiesStore.getProperties(fullPath) : undefined;
          items.push({
            name: entry,
            path: fullPath,
            type: "item",
            isRepo,
            properties,
            children
          } as FSItem);
        } else {
          items.push({
            name: entry,
            path: fullPath,
            type: "file"
          } as FSFile);
        }
      }
    } catch (err) {
      console.error(`Error reading ${dir}:`, err);
    }

    return items;
  }

  /**
   * Get a list with the items until repositories
   * @param dir path to search for repositories
   * @returns an array with the items until repositories
   */
  async function listRepos(dir = "/"): Promise<FSItem[]> {
    const items: FSItem[] = [];
    try {
      const entries = await filesystem.promises.readdir(dir);

      for (const entry of entries) {
        const fullPath = `${dir == "/" ? "" : dir}/${entry}`;
        const stat = await filesystem.promises.stat(fullPath);

        const isRepo = await exists(`${fullPath}/.git`);
        if (isRepo) {
          items.push({
            type: "item",
            name: entry,
            path: fullPath,
            isRepo,
            properties: await propertiesStore.getProperties(fullPath),
          } as FSItem);
        } else if (stat.type == "dir") {
          items.push({
            type: "item",
            name: entry,
            path: fullPath,
            properties: await propertiesStore.getProperties(fullPath),
            children: await listRepos(fullPath)
          } as FSItem);
        }
      }
    } catch (err) {
      console.error(`Error reading ${dir}:`, err);
    }
    return items;
  }

  /**
   * Creates a directory and returns it.
   * If already have a dir with same name, create with a sequence number.
   * @param path path of parent dir
   * @param name name of dir
   * @returns created dir
   */
  async function createDir(path: string, name: string): Promise<FSDir> {
    // Create with a number if already exists
    let dirPath = `${path}/${name}`;
    let num = 0;
    while (await exists(`${dirPath}${num ? ' ' + num : ''}`)) ++num;
    if (num) {
      name += " " + num;
      dirPath = `${path}/${name}`;
    }

    await filesystem.promises.mkdir(dirPath);
    updateRoot();
    
    return {
      type: "dir",
      name,
      path: dirPath
    }
  }

  /**
   * Creates a folder item and returns it.
   * If already have a folder with same name, create with a sequence number.
   * @param path path of parent dir
   * @param name name of dir
   * @returns created dir
   */
  async function createFolder(path: string, name: string): Promise<FSItem> {
    const dir = await createDir(path, name);
    const properties: properties = {
      type: "folder",
      id: uuidV4(),
      order: 0,
      collapsed: true
    };
    await propertiesStore.createProperties(dir.path, properties);

    return {
      type: "item",
      name,
      path: dir.path,
      properties
    }
  }

  /**
   * Creates a file and returns it.
   * If already have a file with same name, create with a sequence number.
   * @param path path of parent dir
   * @param name name of dir
   * @returns created dir
   */
  async function createFile(path: string, name: string, content?: string): Promise<FSFile> {
    // Create with a number if already exists
    let filePath = `${path}/${name}`;
    let num = 0;
    while (await exists(`${filePath}${num ? ' ' + num : ''}`)) ++num;
    if (num) {
      name += " " + num;
      filePath = `${path}/${name}`;
    }

    await filesystem.promises.writeFile(filePath, content ? content : '', "utf8");
    updateRoot();

    return {
      type: "file",
      name,
      path: filePath,
      content
    }
  }

  async function updateRoot() {
    const path = root.value!.path;
    const item = await getItem(path);
    item!.children = await list(path, true);
    root.value = item;

    repos.value = await listRepos("/");
  }

  return {
    filesystem,
    repos,
    root,
    exists,
    getItem,
    list,
    listRepos,
    createDir,
    createFolder,
    createFile,
    updateRoot
  };
});