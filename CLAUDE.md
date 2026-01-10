# Arabic Flashcards - Project Documentation

## Overview

A Next.js web application for learning Lebanese Arabic using spaced repetition. Users can learn vocabulary words and phrases through flashcard-style review sessions.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS + Radix UI components
- **AI**: Anthropic Claude API (for sentence generation)
- **Deployment**: Vercel
- **Animations**: Framer Motion

## Project Structure

```
app/
├── (main)/              # Main authenticated routes
│   ├── page.tsx         # Home/dashboard
│   ├── review/          # Flashcard review session
│   ├── my-words/        # User's vocabulary (all/learning/learned tabs)
│   ├── this-week/       # Weekly progress
│   ├── this-month/      # Monthly progress
│   ├── admin/           # Admin panel (admin/reviewer roles - includes content review)
│   ├── design-system/   # Component library reference
│   └── memory-game/     # Memory matching game
├── api/                 # API routes
│   ├── generate-sentence/  # AI sentence generation
│   ├── generate-hint/      # AI hints
│   └── words/              # Word creation
├── components/          # UI components
│   ├── review/          # Review-specific components
│   └── ...              # Shared components
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   ├── WordsContext.tsx # Word data state
│   └── ProfileContext.tsx # User profile state
├── services/            # Business logic
│   ├── wordService.ts         # Word CRUD operations
│   ├── sentenceService.ts     # Sentence CRUD operations
│   ├── packService.ts         # Vocabulary pack operations
│   ├── adminService.ts        # Admin operations
│   ├── spacedRepetitionService.ts  # SRS algorithm
│   ├── offlineStorage.ts      # localStorage caching
│   ├── syncService.ts         # Offline sync
│   └── claudeService.ts       # AI integration
├── types/               # TypeScript types
│   └── word.ts          # Word & progress types
└── utils/               # Utility functions

components/              # shadcn/ui components
lib/                     # Shared utilities
utils/supabase/          # Supabase client setup
```

## Key Concepts

### Data Model

**Word**
- `id`, `arabic`, `english`, `transliteration`
- `type`: noun | verb | adjective | phrase
- `pack_id`: Links to vocabulary pack (null for custom words)
- `user_id`: Owner for custom words (null for pack words)
- `notes`: User notes

**Sentence** (example sentences, linked to words via `word_sentences`)
- `id`, `arabic`, `transliteration`, `english`
- `user_id`: Owner
- `pack_id`: Links to vocabulary pack (for pack sentences)
- Sentences can link to multiple words, and words can have multiple sentences

**Word Progress** (in `word_progress` table)
- `word_id`: Links to word
- `user_id`: Owner
- `status`: new | learning | learned
- `next_review_date`: SRS scheduling
- `interval`, `ease_factor`, `review_count`: SRS state

**ProgressState**: `new` -> `learning` -> `learned`

Note: Phrases (short multi-word expressions) are stored as words with `type='phrase'`. Full example sentences are in the `sentences` table.

### Spaced Repetition

The app uses a spaced repetition system (see `spacedRepetitionService.ts`):
- Words are scheduled for review based on performance
- Intervals increase as the user demonstrates knowledge
- "Boost" feature temporarily prioritizes a word

### Authentication

- Supabase Auth with Row Level Security (RLS)
- Multi-user support with user isolation
- Role-based access (`user_roles` table) for admin features

### Vocabulary Packs

Pre-built vocabulary sets that users can learn:
- Pack metadata stored in `packs` table
- Pack words stored in `words` table with `pack_id` set (and `user_id` null)
- User progress tracked in `word_progress` table linking `user_id` to `word_id`
- See `packService.ts` for pack operations

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint
```

### Important: Don't run builds during development
Avoid running `npm run build` while the dev server is running - it interferes with the `.next` folder and breaks hot reloading. Use `npm run lint` to check for errors instead.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=your_anthropic_key (for AI features)
```

## Database

See `supabase/MIGRATION_INSTRUCTIONS.md` for database setup and migrations.

Key tables:
- `words` - Vocabulary items (both custom and pack words, including phrases with type='phrase')
- `sentences` - Example sentences showing words in context
- `word_sentences` - Join table linking words to sentences (many-to-many)
- `word_progress` - User progress tracking (links user_id to word_id)
- `packs` - Vocabulary pack metadata
- `user_profiles` - User profile data
- `user_roles` - Admin/user role management

## Common Tasks

### Adding a new page
1. Create folder in `app/(main)/your-page/`
2. Add `page.tsx` with component
3. Update navigation in `AppSidebar.tsx`

### Adding a new word field
1. Update `app/types/word.ts`
2. Update `wordService.ts` queries
3. Update relevant components (WordDetailModal, EditWord, etc.)

### Modifying spaced repetition
- Edit `app/services/spacedRepetitionService.ts`

### Working with Supabase
- Client: `utils/supabase/client.ts` (browser)
- Server: `utils/supabase/server.ts` (server components)

## Style Guide

### Text formatting
- Always use **sentence case** for UI text (headings, buttons, labels, etc.)
  - Correct: "AI credits", "Add new word", "Monthly limit reached"
  - Incorrect: "AI Credits", "Add New Word", "Monthly Limit Reached"
