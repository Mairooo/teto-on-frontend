export interface Projects {
  id: string;
  title: string;
  description?: string;
  likes?: number;
  plays?: number;
  cover_image?: string;
  user_created?: { first_name?: string; last_name?: string } | string;
  status?: string | number; // <-- ajoute cette ligne
}
