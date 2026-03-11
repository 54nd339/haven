import type { Metadata } from 'next';

interface HashtagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: HashtagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const title = `#${tag} | Haven`;
  const description = `Posts tagged with #${tag} on Haven`;

  return {
    title: `#${tag}`,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function HashtagPage({ params }: HashtagPageProps) {
  const { tag } = await params;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="bg-background/80 sticky top-0 z-10 border-b px-4 py-3 backdrop-blur-sm">
        <h1 className="text-lg font-semibold">#{tag}</h1>
        <p className="text-muted-foreground text-sm">Posts tagged with #{tag}</p>
      </div>
      <div className="p-4">
        <p className="text-muted-foreground text-sm">No posts yet.</p>
      </div>
    </div>
  );
}
