import type { FSFile } from "./FSFile";

export interface FSDir {
  name: string;
  path: string;
  type: "dir";
  children?: (FSFile | FSDir)[];
}