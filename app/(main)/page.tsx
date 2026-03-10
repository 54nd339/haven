import { FeedList, PostComposer } from '@/components/feed';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PostComposer />
      <Separator />
      <FeedList />
    </div>
  );
}
