export interface Block {
  id?: string;
  parentId?: string;
  type: string;
  content: any;
  createdAt: Date;
  updatedAt: Date;
}