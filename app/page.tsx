import { getAllStories } from "@/lib/stories";
import PageHeader from "@/components/PageHeader";
import StructuredData from "@/components/StructuredData";
import StoriesGrid from "@/components/StoriesGrid";

export default function Home() {
  const stories = getAllStories();

  return (
    <>
      <StructuredData stories={stories} />
      <div className="min-h-screen bg-scp-bg dark:bg-scp-bg-dark transition-colors duration-200">
        <PageHeader />
        <main className="max-w-6xl mx-auto px-4 sm:py-8 py-2">
          <StoriesGrid stories={stories} />
        </main>

        <footer className="bg-scp-card dark:bg-scp-card-dark border-t border-scp-border dark:border-scp-border-dark mt-16 py-8 transition-colors duration-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 font-mono text-sm transition-colors duration-200">
              GENERATED WITH CLAUDE • STORIES FOR ENTERTAINMENT PURPOSES ONLY •
              INSPIRED BY THE{" "}
              <a className="underline" href="https://scp-wiki.wikidot.com/">
                SCP FOUNDATION
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
