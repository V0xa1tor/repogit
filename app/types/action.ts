export interface action {
  name: string;
  icon: string;
  type: "link" | null;
  to?: string;
};