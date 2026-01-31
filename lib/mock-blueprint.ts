import { ProjectBlueprint } from "@/types/blueprint";

export const mockTodoBlueprint: ProjectBlueprint = {
  meta: {
    name: "FocusList",
    description: "A distraction-free task manager for deep work.",
    techStack: {
      framework: "Next.js 15",
      language: "TypeScript",
      database: "PostgreSQL",
      styling: "Tailwind CSS",
      deployment: "Vercel",
    },
  },
  features: [
    {
      id: "feat-auth",
      name: "User Authentication",
      description: "Secure login/signup using email and password.",
      priority: "high",
      userStories: [
        "As a user, I want to sign up so I can save my tasks.",
        "As a user, I want to log in to access my private list.",
      ],
    },
    {
      id: "feat-tasks",
      name: "Task Management",
      description: "CRUD operations for tasks.",
      priority: "high",
      userStories: [
        "As a user, I want to add a task.",
        "As a user, I want to mark a task as complete.",
        "As a user, I want to delete a task.",
      ],
    },
  ],
  folderStructure: [
    {
      name: "app",
      type: "folder",
      children: [
        { name: "layout.tsx", type: "file", description: "Root layout with providers" },
        { name: "page.tsx", type: "file", description: "Landing page / Dashboard" },
        { name: "globals.css", type: "file", description: "Tailwind imports" },
      ],
    },
    {
      name: "components",
      type: "folder",
      children: [
        { name: "TaskItem.tsx", type: "file", description: "Individual task component" },
        { name: "TaskList.tsx", type: "file", description: "List container for tasks" },
        { name: "AddTaskForm.tsx", type: "file", description: "Input form for new tasks" },
      ],
    },
    {
      name: "lib",
      type: "folder",
      children: [
        { name: "db.ts", type: "file", description: "Database connection client" },
      ],
    },
  ],
  databaseSchema: [
    {
      name: "User",
      description: "Registered application users",
      fields: [
        { name: "id", type: "UUID", required: true, description: "Primary Key" },
        { name: "email", type: "VARCHAR(255)", required: true },
        { name: "password_hash", type: "VARCHAR", required: true },
        { name: "created_at", type: "TIMESTAMP", required: true },
      ],
    },
    {
      name: "Task",
      description: "Individual todo items",
      fields: [
        { name: "id", type: "UUID", required: true, description: "Primary Key" },
        { name: "user_id", type: "UUID", required: true, description: "Foreign Key to User" },
        { name: "title", type: "VARCHAR(255)", required: true },
        { name: "is_completed", type: "BOOLEAN", required: true },
        { name: "due_date", type: "TIMESTAMP", required: false },
      ],
      relationships: ["belongs to User"],
    },
  ],
  coreComponents: [
    {
      name: "TaskService",
      type: "service",
      description: "Handles business logic for task CRUD operations",
    },
    {
      name: "useTasks",
      type: "hook",
      description: "React hook for fetching and managing task state",
    },
  ],
};
