import type { FSFile } from "./FSFile";
import type { properties } from "../repo/properties";
import type { settings } from "../repo/settings";

export interface FSItem {
  type: "item";
  name: string;
  path: string;
  isRepo?: boolean;
  children?: (FSFile | FSItem)[];
  properties?: properties;
  settings?: settings;
}