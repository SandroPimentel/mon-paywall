export interface Dossier {
  id: string;
  title: string;
  description?: string;
  price: number;
  files: string[];
  createdAt: string;
}
