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
│   ├── learning/        # Words currently being learned
│   ├── learned/         # Mastered words
│   ├── archive/         # Archived words
│   ├── phrases/         # Phrase learning
│   ├── this-week/       # Weekly progress
│   ├── this-month/      # Monthly progress
│   └── memory-game/     # Memory matching game
├── api/                 # API routes
│   ├── generate-sentence/  # AI sentence generation
│   ├── generate-hint/      # AI hints
│   ├── phrases/            # CRUD for phrases
│   └── words/              # Word creation
├── components/          # UI components
│   ├── review/          # Review-specific components
│   └── ...              # Shared components
├── contexts/            # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── WordsContext.tsx # Word data state
├── services/            # Business logic
│   ├── wordService.ts         # Word CRUD operations
│   ├── phraseService.ts       # Phrase CRUD operations
│   ├── spacedRepetitionService.ts  # SRS algorithm
│   ├── offlineStorage.ts      # IndexedDB caching
│   ├── syncService.ts         # Offline sync
│   └── claudeService.ts       # AI integration
├── types/               # TypeScript types
│   ├── word.ts          # Word & progress types
│   └── phrase.ts        # Phrase types
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
- `status`: new | learning | learned | archived
- `next_review_date`: SRS scheduling
- `example_sentences`: AI-generated examples
- `notes`: User notes
- `user_id`: Owner (multi-user support)

**Phrase**
- Similar to Word but for longer expressions

**ProgressState**: `new` -> `learning` -> `learned` (or `archived`)

### Spaced Repetition

The app uses a spaced repetition system (see `spacedRepetitionService.ts`):
- Words are scheduled for review based on performance
- Intervals increase as the user demonstrates knowledge
- "Boost" feature temporarily prioritizes a word

### Authentication

- Supabase Auth with Row Level Security (RLS)
- Multi-user support with user isolation
- Role-based access (`user_roles` table) for admin features

### Starter Packs

Pre-built vocabulary sets that new users can install:
- Stored in `starter_packs`, `starter_pack_words`, `starter_pack_phrases`
- Users track installed packs in `user_starter_packs`

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
- `words` - Vocabulary items
- `phrases` - Phrase items
- `word_progress` - User progress tracking
- `starter_packs` - Pre-built word collections
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
