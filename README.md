# Tongue-Tied — GitHub Showcase README Documentation

A production-grade, professional GitHub `README.md` for **Tongue-Tied**, an empathy-driven micro-challenge and language reflection application. The documentation highlights the core product vision, daily challenge mechanics, streak calculation engine, multi-language speech assistant, technical architecture, and local/deployment setup instructions.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following directions were confirmed during Phase 1 interactive clarification:
> - **Documentation Style**: Professional showcase with dynamic status badges, hero banner, feature breakdowns, and reproducible developer setup instructions.
> - **Content Emphasis**: Full showcase covering daily challenge rotation, streak tracking engine, multi-language practice and Web Speech audio helper, journal reflections, and setup guides.

---

## 1. Overview & Core Concept

- **Product Name**: Tongue-Tied
- **Core Mission**: Break social hesitation and build cultural empathy by encouraging language learners and curious explorers to complete real-world, bite-sized conversational challenges.
- **Key Audiences**:
  - Language learners looking to overcome anxiety in real-world scenarios.
  - Travelers and expats navigating unfamiliar linguistic and cultural settings.
  - Open-source developers and portfolio reviewers evaluating modern full-stack React & TypeScript architectures.
- **Key Value**: Bridges the gap between passive language learning apps and spontaneous real-life communication through structured daily prompts, streak accountability, and private reflective journaling.

---

## 2. README Structure & Visual Presentation

The `README.md` file will follow a modern, highly engaging open-source showcase pattern:

### 2.1 Hero & Badges Section
- **Hero Title**: `Tongue-Tied 🗣️` with subtitle and value proposition.
- **Badges**:
  - React 19 (`React-19.0.1-61DAFB?logo=react&logoColor=white`)
  - TypeScript (`TypeScript-7.0-3178C6?logo=typescript&logoColor=white`)
  - Tailwind CSS 4 (`Tailwind_CSS-v4-38B2AC?logo=tailwindcss&logoColor=white`)
  - Vite 8 (`Vite-8.3-646CFF?logo=vite&logoColor=white`)
  - Web Speech API (`Speech_API-Native-FFA500`)
  - License (`License-MIT-green`)
- **Key Highlights Grid**: Three-bullet summary emphasizing micro-challenges, daily streak engine, and 9-language audio support.

### 2.2 Feature Showcase
- **Daily Empathy Challenges**: Daily randomized selection with difficulty levels (*Gentle*, *Brave*, *Bold*), approach types (*Spoken*, *Gestures*), and single-click swap capability.
- **Streak & Consistency Engine**:
  - Calculates consecutive daily challenge completion based on diary entries.
  - Tracks current streaks, best streaks, and past 7-day visual check-ins.
  - Milestone unlock system (*Spark of Courage*, *Week of Wonder*, *Brave Explorer*, *Social Adventurer*).
- **Multi-Language Practice & Native Audio**:
  - Supports 9 languages: Spanish, French, Japanese, Mandarin, Arabic, Italian, German, Vietnamese, Korean.
  - Native browser Web Speech API pronunciation playback with fallback controls.
  - Cultural proverbs and authentic idiomatic expressions with instant clipboard copying.
- **Reflective Diary & Progress Journal**:
  - Emotional state tracking (Excited, Proud, Anxious, Awkward, Relieved, Enlightened).
  - Approach notes, words spoken, difficulty ratings, and favorites.
- **Offline & Flexible Auth Support**:
  - Seamless dual-mode architecture: zero-config local storage guest mode + optional Firebase Firestore persistent sync.

### 2.3 Visual & Design Philosophy
- **Balanced Warm Palette**: Soft warm backgrounds (`#F4F8FA`), sky blue accents, amber and gold streak rewards, and teal confidence badges avoiding sterile or cold blues.
- **Minimalistic First Impression**: Clean daily view with hidden-by-default personalization tucked under the header helper.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Standalone Single-File README with Clear Hierarchy**
  - *Chosen Approach*: Deliver a self-contained, beautifully formatted `README.md` with collapsible sections for advanced configuration so it looks great on both mobile and desktop GitHub viewers.
  - *Why*: Ensures immediate readability while providing deep technical documentation for developers inspecting the repository.
- **Decision 2: Clear Local Run & Environment Documentation**
  - *Chosen Approach*: Document standard Node.js/npm commands (`npm install`, `npm run dev`, `npm run build`) alongside optional Firebase setup instructions.
  - *Why*: Allows anyone cloning the repository to run the app immediately in under 60 seconds without requiring external API keys or cloud credentials.

---

## 4. Technical Architecture & System Reference

```
┌────────────────────────────────────────────────────────┐
│                   Tongue-Tied App                      │
└──────────────────────────┬─────────────────────────────┘
                           │
         ┌─────────────────┼──────────────────┐
         │                 │                  │
         ▼                 ▼                  ▼
  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
  │  Today View  │  │  Diary View  │  │Progress View │
  │ (Daily Goal, │  │ (Reflections,│  │(Streak Engine│
  │ Swap, Done)  │  │ Mood, Notes) │  │ 7-Day Matrix)│
  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           │
                           ▼
          ┌───────────────────────────────────┐
          │  Phrases & Personalization Modal  │
          │  - 9 Language Packs               │
          │  - Web Speech API (Synthesis)     │
          │  - Cultural Wisdom Quotes         │
          └────────────────┬──────────────────┘
                           │
                           ▼
          ┌───────────────────────────────────┐
          │ Storage & Persistence Layer       │
          │ - LocalStorage (Guest Mode)       │
          │ - Firebase Firestore (Cloud Sync) │
          └───────────────────────────────────┘
```

## Verification Plan
1. Validate that `README.md` is written to repository root `/README.md`.
2. Ensure markdown syntax, code fences, badges, and tables render cleanly without broken formatting.
3. Verify that all npm scripts described in `README.md` match `package.json`.
