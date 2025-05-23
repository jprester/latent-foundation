export interface Story {
  id: string;
  title: string;
  class: "Safe" | "Euclid" | "Keter";
  tags: string[];
  date: string;
  content: string;
  slug: string;
}

export interface StoryMatter {
  title: string;
  class: "Safe" | "Euclid" | "Keter";
  tags: string[];
  date: string;
}
