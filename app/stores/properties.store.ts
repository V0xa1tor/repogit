import type { properties } from "~/types/repo/properties";

export const usePropertiesStore = defineStore('properties', () => {

  const appConfig = useAppConfig();
  const filesystemStore = useFilesystemStore();

  const rootProperties: properties = {
    id: "root",
    type: "folder",
    order: 0,
    collapsed: false
  };

  async function createProperties(path: string, properties: properties) {
    const propertiesPath = `${path == "/" ? "" : path}/${appConfig.propertiesFileName}`;
    await filesystemStore.filesystem.promises.writeFile(propertiesPath, JSON.stringify(properties, null, '\t'), "utf8");
  }

  async function getProperties(path: string): Promise<properties> {
    const propertiesPath = `${path == "/" ? "" : path}/${appConfig.propertiesFileName}`;
    return JSON.parse(await filesystemStore.filesystem.promises.readFile(propertiesPath, "utf8"));
  }

  async function setProperties(path: string, properties: properties) {
    const propertiesPath = `${path == "/" ? "" : path}/${appConfig.propertiesFileName}`;
    await filesystemStore.filesystem.promises.writeFile(propertiesPath, JSON.stringify(properties, null, '\t'), "utf8");
    filesystemStore.updateRoot();
  }

  return {
    createProperties,
    getProperties,
    setProperties,
    rootProperties
  };
});
