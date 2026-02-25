'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Clock, Loader2, UserPlus, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { followUser, unfollowUser } from '@/lib/actions/social.actions';
import type { SearchUser } from '@/lib/db/queries/search.queries';

interface FollowButtonProps {
  userId: string;
  initialStatus: 'none' | 'following' | 'pending' | 'self';
  /** When provided (e.g. ['suggested-users']), optimistically updates that query on follow/unfollow */
  queryKeyToUpdate?: readonly unknown[];
}

export function FollowButton({ userId, initialStatus, queryKeyToUpdate }: FollowButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(initialStatus);
  const [isHovering, setIsHovering] = useState(false);

  const { mutate: follow, isPending: isFollowPending } = useMutation({
    mutationFn: () => followUser(userId),
    onMutate: async () => {
      const previousStatus = status;
      setStatus('following');
      if (queryKeyToUpdate) {
        await queryClient.cancelQueries({ queryKey: [...queryKeyToUpdate] });
        const previous = queryClient.getQueryData<SearchUser[]>(queryKeyToUpdate);
        queryClient.setQueryData<SearchUser[]>(queryKeyToUpdate, (old) =>
          old ? old.filter((u) => u.id !== userId) : old,
        );
        return { previousStatus, previousQueryData: previous };
      }
      return { previousStatus };
    },
    onSuccess: (result) => {
      setStatus(result.status === 'accepted' ? 'following' : 'pending');
      toast.success(result.status === 'accepted' ? 'Following!' : 'Follow request sent');
      router.refresh();
    },
    onError: (err, _, context) => {
      setStatus(context?.previousStatus ?? initialStatus);
      if (context?.previousQueryData !== undefined && queryKeyToUpdate) {
        queryClient.setQueryData(queryKeyToUpdate, context.previousQueryData);
      }
      toast.error(err.message);
    },
    onSettled: () => {
      if (queryKeyToUpdate) {
        queryClient.invalidateQueries({ queryKey: [...queryKeyToUpdate] });
      }
    },
  });

  const { mutate: unfollow, isPending: isUnfollowPending } = useMutation({
    mutationFn: () => unfollowUser(userId),
    onMutate: async () => {
      const previousStatus = status;
      setStatus('none');
      if (queryKeyToUpdate) {
        await queryClient.cancelQueries({ queryKey: [...queryKeyToUpdate] });
        const previous = queryClient.getQueryData<SearchUser[]>(queryKeyToUpdate);
        queryClient.setQueryData<SearchUser[]>(queryKeyToUpdate, (old) => {
          if (!old) return old;
          return old.map((u) => (u.id === userId ? { ...u, isFollowing: false } : u));
        });
        return { previousStatus, previousQueryData: previous };
      }
      return { previousStatus };
    },
    onSuccess: () => {
      setStatus('none');
      toast.success('Unfollowed');
      router.refresh();
    },
    onError: (_err, _, context) => {
      setStatus(context?.previousStatus ?? initialStatus);
      if (context?.previousQueryData !== undefined && queryKeyToUpdate) {
        queryClient.setQueryData(queryKeyToUpdate, context.previousQueryData);
      }
    },
    onSettled: () => {
      if (queryKeyToUpdate) {
        queryClient.invalidateQueries({ queryKey: [...queryKeyToUpdate] });
      }
    },
  });

  if (status === 'self') return null;

  const isPending = isFollowPending || isUnfollowPending;

  if (status === 'none') {
    return (
      <Button size="sm" disabled={isPending} onClick={() => follow()}>
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        Follow
      </Button>
    );
  }

  if (status === 'pending') {
    return (
      <Button variant="outline" size="sm" disabled={isPending} onClick={() => unfollow()}>
        <Clock className="size-4" />
        Requested
      </Button>
    );
  }

  return (
    <Button
      variant={isHovering ? 'destructive' : 'outline'}
      size="sm"
      disabled={isPending}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={() => unfollow()}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isHovering ? (
        <>
          <UserX className="size-4" />
          Unfollow
        </>
      ) : (
        <>
          <Check className="size-4" />
          Following
        </>
      )}
    </Button>
  );
}
