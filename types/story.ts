export interface Story {
  id: string;
  title: string;
  class: "Safe" | "Euclid" | "Keter";
  tags: string[];
  date: string;
  content: string;
  slug: string;
  thumbnail?: string; // Optional thumbnail path
  images?: string[]; // Optional array of additional image paths
}

export interface StoryMatter {
  title: string;
  class: "Safe" | "Euclid" | "Keter";
  tags: string[];
  date: string;
  thumbnail?: string;
  images?: string[];
}
