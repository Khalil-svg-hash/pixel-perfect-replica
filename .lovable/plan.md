

# Social Media Platform — MVP Implementation Plan

## Phase 1: Design System & Foundation (E0)
- Define color palette (light/dark mode), typography scale, spacing/radius tokens in Tailwind config
- Build reusable component variants: buttons, inputs, cards, modals, toasts, tabs, chips, badges, avatars
- Set up responsive 12-column grid layout templates (feed, detail, composer, settings)
- Add RTL support with `dir` attribute toggling and mirrored layouts for EN/AR
- Implement skeleton loaders, empty states, error pages (404/500), and loading patterns

## Phase 2: Authentication & Accounts (E1)
- Connect Supabase (Lovable Cloud) for auth, database, and storage
- Build sign-up, login, and password reset pages with inline validation
- Create profiles table with auto-creation trigger on signup
- Set up user roles table (admin, moderator, user) with security-definer function
- Add MFA setup and code entry screen
- Implement protected routes and auth state management

## Phase 3: User Profiles (E2)
- Profile view page: avatar, cover image, bio, post/follower/following counts
- Profile edit page: avatar upload with crop, bio editing, display name
- Privacy toggle: public/private account setting
- Follow button with appropriate states (follow/unfollow/requested)

## Phase 4: Posting & Feed (E3 + E4)
- Post composer: text area with character count, hashtag/mention autocomplete, media attachment tray, visibility selector
- Media upload: image grid (1-4), video support with poster/duration, reorder/remove
- Post card component: avatar, name/handle, timestamp, text, media grid, action bar (like, comment, share), overflow menu
- Edit-within-10-min functionality with "edited" badge
- Home feed with infinite scroll, pull-to-refresh, skeleton loaders
- Empty feed state with suggested follows module

## Phase 5: Social Graph (E5)
- Follow/unfollow actions with optimistic UI updates
- Follow request approval flow for private accounts
- Followers/following list pages with search and pagination
- Block and mute functionality with confirmation dialogs

## Phase 6: Engagement (E6)
- Like/reaction with micro-interaction animation and counter
- Flat comments: thread layout, composer, delete own comment, pagination
- @Mention typeahead in posts and comments

## Phase 7: Notifications (E7)
- Notification center: list with avatars, type icons, unread indicators, bulk mark-read
- Real-time notifications via Supabase Realtime
- Notification preferences settings page

## Phase 8: Search (E8)
- Universal search bar with recent searches and debounced input
- Results tabs: Users, Hashtags
- Hashtag detail page with chronological posts

## Phase 9: Moderation & Safety (E9)
- Report content flow: entry points on posts/comments/profiles, reason selector, confirmation
- Profanity/keyword filter with inline feedback
- Content warning blur overlays for flagged media

## Phase 10: Admin Console (E10)
- Moderator dashboard with report queue, filters, and detail view
- User search with quick actions (disable posting, reset password)
- Audit trail for moderation actions
- Role-based access control (only admin/moderator roles can access)

## Phase 11: Localization (E11)
- Language switcher (EN/AR) with persistence
- RTL layout verification across all screens
- i18n integration for all user-facing strings

## Database Schema (Key Tables)
- `profiles` — user profiles linked to auth.users
- `user_roles` — role-based access (admin, moderator, user)
- `posts` — text, media references, visibility, timestamps
- `post_media` — uploaded images/videos linked to posts
- `comments` — flat comments on posts
- `likes` — post likes
- `follows` — follower/following relationships with status (accepted/pending)
- `blocks` — block relationships
- `notifications` — in-app notifications
- `reports` — content/user reports
- `hashtags` — hashtag registry with post counts

This will be built incrementally, phase by phase, so you can review and test each layer before moving on.

