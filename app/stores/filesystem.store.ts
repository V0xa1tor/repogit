import LightningFS from "@isomorphic-git/lightning-fs";
import type { FSFile } from "~/types/filesystem/FSFile";
import type { FSDir } from "~/types/filesystem/FSDir";

export const useFilesystemStore = defineStore("filesystem", () => {

  const appConfig = useAppConfig();

  const filesystem = new LightningFS(appConfig.fsName);

  /**
   * Checks if a file or dir exists
   * @param path file or dir to check if exists
   * @returns true if exists, false if not
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
   * List all files and directories in a directory
   * @param dir Directory to list. Defaults to "/"
   * @param recursive If list subdirectories. Defaults to false
   * @returns Array of file/dir
   */
  async function listFilesAndDirs(dir = "/", recursive = false): Promise<(FSFile | FSDir)[]> {
    const items: (FSFile | FSDir)[] = [];
    try {
      const entries = await filesystem.promises.readdir(dir);

      for (const entry of entries) {
        const fullPath = `${dir == "/" ? "" : dir}/${entry}`;
        const stat = await filesystem.promises.stat(fullPath);

        if (stat.type == "dir") {
          const children = recursive ? await listFilesAndDirs(fullPath, true) : undefined;
          items.push({
            name: entry,
            path: fullPath,
            type: "dir",
            children: recursive ? children : undefined
          } as FSDir);
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

  return {
    filesystem,
    exists,
    listFilesAndDirs
  };
});