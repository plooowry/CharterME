# CharterME

An AI-powered platform that helps UK engineering professionals prepare their Chartered Engineer (CEng) applications. It maps your experience to the UK-SPEC competencies, gives AI feedback on your evidence, and helps draft the final application.

This is a proof of concept.

## Features

- **Competency navigator:** browse the UK-SPEC competencies and sub-competencies and track progress against each one.
- **Evidence hub:** record and organise evidence of your experience against each competency.
- **AI application drafter:** generate and refine application text from your recorded evidence, using the Gemini API.
- **Resource hub:** guidance and reference material for the chartership process.
- **Dashboard and profile:** an overview of progress, with user authentication.

## Tech stack

- React 19 and TypeScript
- Vite
- React Router
- Google Gemini API (`@google/genai`)

## Getting started

Prerequisites: Node.js

1. Install dependencies:
   ```
   npm install
   ```
2. Create a `.env.local` file and set your Gemini API key:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Project structure

```
components/   UI, grouped by area (ai, auth, competencies, dashboard, evidence, resources)
services/     Gemini API integration
types.ts      Shared types
constants.ts  Competency data and constants
```

## Status

Proof of concept. Not affiliated with or endorsed by the Engineering Council or any professional engineering institution.
