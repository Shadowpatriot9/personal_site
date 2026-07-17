export interface AdminProject {
  _id?: string;
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  technology: string[];
  tags: string[];
  dateCreated: string | null;
  link: string;
  body: string;
  image: string;
  gallery: string[];
  published: boolean;
  order: number;
  route?: string;
  [key: string]: unknown;
}
