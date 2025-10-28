import type { itemType } from "../filesystem/itemType";

export interface properties {
  id: string;
  type: itemType;
  order: number;
  collapsed: boolean;
}