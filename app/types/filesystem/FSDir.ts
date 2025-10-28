import type { FSFile } from "./FSFile";
import type { FSItem } from "./FSItem";

export interface FSDir {
  type: "dir";
  name: string;
  path: string;
  children?: (FSFile | FSDir | FSItem)[];
}