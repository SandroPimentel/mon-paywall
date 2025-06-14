export type Dossier = {
  id: string;
  title: string;
  description?: string;
  price: number;
  createdAt: string;
  files: string[]; // jamais undefined !
  images?: string;
}
