export interface IUser {
  id: string;
  email: string;
  role: {
    id: number;
    name: string; // <-- Así TypeScript sabrá que 'role' contiene un objeto con 'name'
  };
  createdAt: string;
}
