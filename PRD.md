# Product Requirements Document (PRD)

| **Project Name** | **Adjutant** |
| :--- | :--- |
| **Version** | 1.0 (Draft) |
| **Date** | January 30, 2026 |
| **Role** | AI Software Architect & Implementation Assistant |
| **Target User** | Senior Software Developers & technical founders |

## 1. Executive Summary
**Adjutant** is a local-first, AI-powered software development platform designed to act as a "Professional AI Pair-Programmer." Unlike standard coding assistants that focus on autocompletion or unchecked autonomy, Adjutant focuses on **Architectural Integrity** and **Strategic Execution**. It employs a strict "Human-in-the-Loop" workflow where the AI proposes structural blueprints and user journeys for validation before executing code layer-by-layer, ensuring the final output adheres to "Clean Code" standards and verified design patterns.

## 2. Problem Statement
Current AI coding tools optimize for speed and isolated syntax correctness but suffer from **Architectural Drift**. They lack a persistent understanding of the broader system design, leading to code that functions in isolation but degrades the overall system quality ("Spaghetti Code"). Senior developers currently spend excessive time refactoring AI-generated code to meet professional standards, neutralizing the intended productivity gains.

## 3. Product Principles (The "Why")
*   **Design First, Code Second:** No code is written until a structural blueprint is approved.
*   **Verification over Speed:** The system prioritizes correct, maintainable architecture over rapid generation.
*   **Atomic Interaction:** Implementation happens in isolated, testable "checkpoints" (e.g., "Review the Header") rather than batch dumps.
*   **Clean Code Compliance:** Output must stricly adhere to language-specific design patterns (e.g., DRY, SOLID, React Hooks conventions).

## 4. Technical Stack
*   **Frontend:** Next.js (React)
*   **Styling:** Tailwind CSS (Focus on utility-first maintainability)
*   **Backend/Database:** PostgreSQL (Relational integrity for project structures + `pgvector` for AI context)
*   **Deployment:** Local-First environment.

## 5. User Workflow (The "Happy Path")

### Phase 1: Interactive Discovery
1.  **The Interview:** User initiates a new project. Adjutant acts as a Requirements Engineer, asking targeted questions to clarify scope, edge cases, and business logic.
2.  **The Blueprint:** Adjutant analyzes the answers and generates a **Structural Proposal** containing:
    *   **High-Level Summary:** Features list and technical choices.
    *   **Architecture Tree:** A visual/text representation of the folder structure, core Classes, Interfaces, and Database Schema.
3.  **Validation:** User reviews the Blueprint. They can refine ("Change the database schema to support multi-tenancy") or approve.

### Phase 2: Design & Prototyping
4.  **Journey Mapping:** Upon Blueprint approval, Adjutant generates detailed **User Journeys** and flow descriptions.
5.  **External Prototyping:** These outputs are formatted for easy export to design tools (like Figma) or IDE assistants (like Cursor for preliminary UI scaffolding).

### Phase 3: Checkpoint Implementation
6.  **The "Green Light":** User confirms the design is ready for logic implementation.
7.  **Step-by-Step Implementation:** Adjutant builds the application in atomic units (e.g., "Implementing Authentication Middleware").
8.  **The Feedback Loop:**
    *   **AI:** "I have implemented the Top Navigation Bar. Here is the code/preview."
    *   **User:** Reviews the specific component.
    *   **Action:** User either approves ("Proceed to Hero Section") or requests changes ("Fix the mobile responsiveness").
    *   *Constraint:* The AI cannot proceed to the next module until the current step is approved.

## 6. Key Features (MVP)

### Core Features
*   **Context-Aware Chat:** An LLM interface deep-linked to the project's file structure.
*   **Blueprint Generator:** Auto-scaffolds folder structures and empty files based on approved architecture.
*   **Strict Linter Integration:** AI output is pre-validated against standard linters (ESLint/Prettier) before being shown to the user.
*   **Step-Debugger Mode:** A UI that tracks "Current Task," "Completed Tasks," and "Pending Review," mimicking a Jira Kanban board.

## 7. Success Metrics (KPIs)
*   **Correction Ratio:** The percentage of AI-generated code lines that require manual refactoring by the user (Target: < 15%).
*   **Checkpoint Velocity:** The average time taken to clear a single "Checkpoint" (implementation + review).
