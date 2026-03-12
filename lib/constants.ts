export const APP_NAME = 'Haven' as const;
export const APP_DESCRIPTION =
  'A privacy-first, ad-free social platform for genuine connection.' as const;

export const MAX_POST_LENGTH = 5000 as const;
export const MAX_COMMENT_LENGTH = 2000 as const;
export const MAX_BIO_LENGTH = 300 as const;
export const MAX_STATUS_LENGTH = 80 as const;
export const MAX_DISPLAY_NAME_LENGTH = 50 as const;
export const MAX_USERNAME_LENGTH = 30 as const;
export const MAX_PINNED_POSTS = 3 as const;
export const MAX_CIRCLE_MEMBERS = 50 as const;
export const MAX_POLL_OPTIONS = 6 as const;
export const MAX_IMAGES_PER_POST = 10 as const;

export const STORY_DURATION_HOURS = 24 as const;
export const DEFAULT_PAGE_SIZE = 20 as const;

export const REACTION_TYPES = [
  'insightful',
  'creative',
  'supportive',
  'funny',
  'heartwarming',
  'fire',
] as const;

export const POST_VISIBILITY = ['public', 'followers', 'circle'] as const;

export const MESSAGE_TYPES = ['text', 'voice', 'emoji', 'image', 'doc', 'gif', 'sticker'] as const;

export const REPORT_REASONS = ['abuse', 'spam', 'harassment', 'impersonation', 'other'] as const;

export const BADGE_TYPES = [
  'first_post',
  'century_days',
  'community_helper',
  'conversation_starter',
  'circle_builder',
  'storyteller',
] as const;
