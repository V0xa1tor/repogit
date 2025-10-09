import type { Block } from "./Block";

export interface PageBlock extends Block {
  type: "page";
  content: {
    title: string,
    text: string
  };
}