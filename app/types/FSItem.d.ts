interface FSItem {
  id: string;
  name: string;
  path: string;
  type?: 'page' | 'database';
  children?: FSItem[]; // Apenas para diretórios
  collapsed?: boolean;
}