import LightningFS from "@isomorphic-git/lightning-fs";

export default interface FSInstance {
  name: string;
  fs: LightningFS;
  pfs: LightningFS.PromisifiedFS;
};