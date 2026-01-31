# Adjutant

**Adjutant** is a local-first, AI-powered software development platform designed to act as a "Professional AI Pair-Programmer."

## Overview

Unlike standard coding assistants, Adjutant focuses on **Architectural Integrity** and **Strategic Execution**. It employs a "Human-in-the-Loop" workflow:

1.  **Discovery:** AI gathers requirements.
2.  **Blueprint:** AI proposes architecture.
3.  **Execution:** AI builds code in verified atomic steps.

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (with `pgvector` compatibility)
- **Linting:** ESLint

## Getting Started

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm run dev
    ```

3.  **Open:** [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components.
- `/lib`: Utility functions and configuration.
- `/services`: Business logic and external service integrations.
- `/types`: TypeScript interfaces and type definitions.
- `PRD.md`: Full Product Requirements Document.
